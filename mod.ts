import { base64url } from "./deps.ts";
import {
  create as createSignature,
  verify as verifySignature,
} from "./signature.ts";
import { Algorithm, verify as verifyAlgorithm } from "./algorithm.ts";
import {
  decoder,
  encoder,
  isArray,
  isDefined,
  isNotNumber,
  isNotString,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from "./util.ts";

/**
 * JWT §1: JWTs encode claims to be transmitted as a JSON [RFC7159] object [...].
 * JWT §4.1: The following Claim Names are registered in the IANA
 * "JSON Web Token Claims" registry established by Section 10.1. None of the
 * claims defined below are intended to be mandatory to use or implement in all
 * cases, but rather they provide a starting point for a set of useful,
 * interoperable claims.
 * Applications using JWTs should define which specific claims they use and when
 * they are required or optional.
 */
export interface Payload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

/**
 * JWS §4.1.1: The "alg" value is a case-sensitive ASCII string containing a
 * StringOrURI value. This Header Parameter MUST be present and MUST be
 * understood and processed by implementations.
 */
export interface Header {
  alg: Algorithm;
  [key: string]: unknown;
}

/**
 * With `expLeeway` and `nbfLeeway` implementers may provide for some small
 * leeway to account for clock skew (JWT §4.1.4). The default is 1 second.
 * By passing the option `audience`, this application tries to identify the
 * recipient with a value in the `aud` claim. If the values don't match, an
 * `Error` is thrown.
 */
export type VerifyOptions = {
  expLeeway?: number;
  nbfLeeway?: number;
  audience?: string | string[] | RegExp;
};

function isExpired(exp: number, leeway: number): boolean {
  return exp + leeway < Date.now() / 1000;
}

function isTooEarly(nbf: number, leeway: number): boolean {
  return nbf - leeway > Date.now() / 1000;
}

function is3Tuple(arr: unknown[]): arr is [unknown, unknown, Uint8Array] {
  return arr.length === 3;
}

function hasInvalidTimingClaims(...claimValues: unknown[]): boolean {
  return claimValues.some((claimValue) =>
    isDefined(claimValue) && isNotNumber(claimValue)
  );
}

function validateTimingClaims(
  payload: Payload,
  { expLeeway = 1, nbfLeeway = 1 }: VerifyOptions = {},
): void {
  if (hasInvalidTimingClaims(payload.exp, payload.nbf)) {
    throw new Error(`The jwt has an invalid 'exp' or 'nbf' claim.`);
  }

  if (isNumber(payload.exp) && isExpired(payload.exp, expLeeway)) {
    throw RangeError("The jwt is expired.");
  }

  if (isNumber(payload.nbf) && isTooEarly(payload.nbf, nbfLeeway)) {
    throw RangeError("The jwt is used too early.");
  }
}

function hasValidAudClaim(claimValue: unknown): claimValue is Payload["aud"] {
  if (isUndefined(claimValue) || isString(claimValue)) return true;
  else return isArray(claimValue) && claimValue.every(isString);
}

function validateAudClaim(
  aud: unknown,
  audience: Required<VerifyOptions>["audience"],
): void {
  if (hasValidAudClaim(aud)) {
    if (isUndefined(aud)) {
      throw new Error("The jwt has no 'aud' claim.");
    }
    const audArray = isString(aud) ? [aud] : aud;
    const audienceArrayOrRegex = isString(audience) ? [audience] : audience;
    if (
      !audArray.some((audString) =>
        isArray(audienceArrayOrRegex)
          ? audienceArrayOrRegex.includes(audString)
          : audienceArrayOrRegex.test(audString)
      )
    ) {
      throw new Error(
        "The identification with the value in the 'aud' claim has failed.",
      );
    }
  } else {
    throw new Error(`The jwt has an invalid 'aud' claim.`);
  }
}

/**
 * Takes a `jwt` and returns a 3-tuple `[unknown, unknown, Uint8Array]` if the
 * jwt has a valid _serialization_. Otherwise it throws an `Error`. This function
 * does **not** verify the digital signature.
 */
export function decode(
  jwt: string,
): [header: unknown, payload: unknown, signature: Uint8Array] {
  try {
    const arr = jwt
      .split(".")
      .map(base64url.decode)
      .map((uint8Array, index) =>
        index === 0 || index === 1
          ? JSON.parse(decoder.decode(uint8Array))
          : uint8Array
      );
    if (is3Tuple(arr)) return arr;
    else throw new Error();
  } catch {
    throw Error("The serialization of the jwt is invalid.");
  }
}

/** It does **not** verify the digital signature. */
export function validate(
  // deno-lint-ignore no-explicit-any
  [header, payload, signature]: [any, any, Uint8Array],
  options?: VerifyOptions,
): {
  header: Header;
  payload: Payload;
  signature: Uint8Array;
} {
  if (isNotString(header?.alg)) {
    throw new Error(`The jwt's 'alg' header parameter value must be a string.`);
  }

  /*
   * JWT §7.2: Verify that the resulting octet sequence is a UTF-8-encoded
   * representation of a completely valid JSON object conforming to RFC 7159;
   * let the JWT Claims Set be this JSON object.
   */
  if (isObject(payload)) {
    validateTimingClaims(payload, options);
    if (isDefined(options?.audience)) {
      validateAudClaim(payload.aud, options!.audience);
    }

    return {
      header,
      payload,
      signature,
    };
  } else {
    throw new Error(`The jwt claims set is not a JSON object.`);
  }
}

/**
 * Takes jwt, `CryptoKey` and `VerifyOptions` and returns the `Payload` of the
 * jwt if the jwt is valid. Otherwise it throws an `Error`.
 */
export async function verify(
  jwt: string,
  key: CryptoKey | null,
  options?: VerifyOptions,
): Promise<Payload> {
  const { header, payload, signature } = validate(decode(jwt), options);
  if (verifyAlgorithm(header.alg, key)) {
    if (
      !(await verifySignature(
        signature,
        key,
        header.alg,
        jwt.slice(0, jwt.lastIndexOf(".")),
      ))
    ) {
      throw new Error(
        "The jwt's signature does not match the verification signature.",
      );
    }

    return payload;
  } else {
    throw new Error(
      `The jwt's alg '${header.alg}' does not match the key's algorithm.`,
    );
  }
}

/**
 * JWT §3: JWTs represent a set of claims as a JSON object that is encoded in
 * a JWS and/or JWE structure. This JSON object is the JWT Claims Set.
 * JSW §7.1: The JWS Compact Serialization represents digitally signed or MACed
 * content as a compact, URL-safe string. This string is:
 *       BASE64URL(UTF8(JWS Protected Header)) || '.' ||
 *       BASE64URL(JWS Payload) || '.' ||
 *       BASE64URL(JWS Signature)
 */
function createSigningInput(header: Header, payload: Payload): string {
  return `${base64url.encode(encoder.encode(JSON.stringify(header)))}.${
    base64url.encode(encoder.encode(JSON.stringify(payload)))
  }`;
}

/**
 * Takes `Header`, `Payload` and `CryptoKey` and returns the url-safe encoded
 * jwt.
 */
export async function create(
  header: Header,
  payload: Payload,
  key: CryptoKey | null,
): Promise<string> {
  if (verifyAlgorithm(header.alg, key)) {
    const signingInput = createSigningInput(header, payload);
    const signature = await createSignature(header.alg, key, signingInput);

    return `${signingInput}.${signature}`;
  } else {
    throw new Error(
      `The jwt's alg '${header.alg}' does not match the key's algorithm.`,
    );
  }
}

/**
 * This helper function simplifies setting a `NumericDate`. It takes either a
 * `Date` object or a `number` (in seconds) and returns the `number` of seconds
 * from 1970-01-01T00:00:00Z UTC until the specified UTC date/time.
 */
export function getNumericDate(exp: number | Date): number {
  return Math.round(
    (exp instanceof Date ? exp.getTime() : Date.now() + exp * 1000) / 1000,
  );
}
