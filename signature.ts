import type { Algorithm } from "./algorithm.ts";
import { getAlgorithm } from "./algorithm.ts";
import { base64url } from "./deps.ts";
import { encoder } from "./mod.ts";

export async function verify(
  signature: Uint8Array,
  key: CryptoKey | null,
  alg: Algorithm,
  signingInput: string,
): Promise<boolean> {
  return key === null ? signature.length === 0 : await crypto.subtle.verify(
    getAlgorithm(alg),
    key,
    signature,
    encoder.encode(signingInput),
  );
}

export async function create(
  alg: Algorithm,
  key: CryptoKey | null,
  signingInput: string,
): Promise<string> {
  return key === null ? "" : base64url.encode(
    new Uint8Array(
      await crypto.subtle.sign(
        getAlgorithm(alg),
        key,
        encoder.encode(signingInput),
      ),
    ),
  );
}
