import { base64url } from "./deps.ts";
import {
  create as createSignature,
  verify as verifySignature,
} from "./signature.ts";
import { verify as verifyAlgorithm } from "./algorithm.ts";

import type { Algorithm } from "./algorithm.ts";

// https://github.com/microsoft/TypeScript/issues/1897
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

type Decoded = [header: JsonValue, payload: JsonValue, signature: Uint8Array];

/** JWT §1: JWTs encode claims to be transmitted as a JSON [RFC7159] object [...]. */
export interface Payload {
  [key: string]: JsonValue;
}

/*
 * JWS §4.1.1: The "alg" value is a case-sensitive ASCII string containing a
 * StringOrURI value. This Header Parameter MUST be present and MUST be
 * understood and processed by implementations.
 */
export interface Header {
  alg: Algorithm;
  [key: string]: JsonValue;
}

export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

/*
 * JWT §4.1.4: Implementers MAY provide for some small leeway to account for
 * clock skew.
 */
function isExpired(exp: number, leeway = 0): boolean {
  return exp + leeway < Date.now() / 1000;
}

function isTooEarly(nbf: number, leeway = 0): boolean {
  return nbf - leeway > Date.now() / 1000;
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null && typeof obj === "object" && Array.isArray(obj) === false
  );
}

function is3Tuple(arr: unknown[]): arr is [unknown, unknown, Uint8Array] {
  return arr.length === 3;
}

function hasInvalidTimingClaims(...claimValues: unknown[]): boolean {
  return claimValues.some((claimValue) =>
    claimValue !== undefined ? typeof claimValue !== "number" : false
  );
}

function isHeader(headerMaybe: unknown): headerMaybe is Header {
  return isObject(headerMaybe) && typeof headerMaybe.alg === "string";
}

export function decode(jwt: string): Decoded {
  try {
    const arr = jwt
      .split(".")
      .map(base64url.decode)
      .map((uint8Array, index) =>
        index === 0 || index === 1
          ? JSON.parse(decoder.decode(uint8Array))
          : uint8Array
      );
    if (is3Tuple(arr)) return arr as Decoded;
    else throw new Error();
  } catch {
    throw Error("The serialization of the jwt is invalid.");
  }
}

export function validate([header, payload, signature]: Decoded): {
  header: Header;
  payload: Payload;
  signature: Uint8Array;
} {
  if (isHeader(header)) {
    /*
   * JWT §7.2: Verify that the resulting octet sequence is a UTF-8-encoded
   * representation of a completely valid JSON object conforming to RFC 7159;
   * let the JWT Claims Set be this JSON object.
   */
    if (isObject(payload)) {
      if (hasInvalidTimingClaims(payload.exp, payload.nbf)) {
        throw new Error(`The jwt has an invalid 'exp' or 'nbf' claim.`);
      }

      if (typeof payload.exp === "number" && isExpired(payload.exp, 1)) {
        throw RangeError("The jwt is expired.");
      }

      if (typeof payload.nbf === "number" && isTooEarly(payload.nbf, 1)) {
        throw RangeError("The jwt is used too early.");
      }

      return {
        header,
        payload,
        signature,
      };
    } else {
      throw new Error(`The jwt claims set is not a JSON object.`);
    }
  } else {
    throw new Error(`The jwt's 'alg' header parameter value must be a string.`);
  }
}

export async function verify(
  jwt: string,
  key: CryptoKey | null,
): Promise<Payload> {
  const { header, payload, signature } = validate(decode(jwt));
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

/*
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

/*
 * Helper function: getNumericDate()
 * returns the number of seconds since January 1, 1970, 00:00:00 UTC
 */
export function getNumericDate(exp: number | Date): number {
  return Math.round(
    (exp instanceof Date ? exp.getTime() : Date.now() + exp * 1000) / 1000,
  );
}
