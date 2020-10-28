import type { Algorithm } from "./_algorithm.ts";
import {
  base64url,
  convertHexToUint8Array,
  HmacSha256,
  HmacSha512,
  RSA,
} from "./depts.ts";

function assertNever(alg: never, message: string): never {
  throw new RangeError(message);
}

export function convertHexToBase64url(input: string): string {
  return base64url.encode(convertHexToUint8Array(input));
}

async function encrypt(
  algorithm: Algorithm,
  key: string,
  message: string,
): Promise<string> {
  switch (algorithm) {
    case "none":
      return "";
    case "HS256":
      return new HmacSha256(key).update(message).toString();
    case "HS512":
      return new HmacSha512(key).update(message).toString();
    case "RS256":
      return (
        await new RSA(RSA.parseKey(key)).sign(message, { hash: "sha256" })
      ).hex();
    default:
      assertNever(
        algorithm,
        "no matching crypto algorithm in the header: " + algorithm,
      );
  }
}

export async function create(
  algorithm: Algorithm,
  key: string,
  input: string,
): Promise<string> {
  return convertHexToBase64url(await encrypt(algorithm, key, input));
}

export async function verify({
  signature,
  key,
  algorithm,
  signingInput,
}: {
  signature: string;
  key: string;
  algorithm: Algorithm;
  signingInput: string;
}): Promise<boolean> {
  switch (algorithm) {
    case "none":
    case "HS256":
    case "HS512": {
      return signature === (await encrypt(algorithm, key, signingInput));
    }
    case "RS256": {
      return await new RSA(RSA.parseKey(key)).verify(
        convertHexToUint8Array(signature),
        signingInput,
        { hash: "sha256" },
      );
    }
    default:
      assertNever(
        algorithm,
        "no matching crypto algorithm in the header: " + algorithm,
      );
  }
}
