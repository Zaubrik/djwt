import {
  convertBase64ToUint8Array,
  convertUint8ArrayToBase64,
} from "./base64.ts";
import {
  convertBase64urlToBase64,
  convertBase64ToBase64url,
} from "https://deno.land/std@v0.59.0/encoding/base64url.ts";

function convertBase64urlToUint8Array(base64url: string): Uint8Array {
  return convertBase64ToUint8Array(convertBase64urlToBase64(base64url));
}

function convertUint8ArrayToBase64url(uint8Array: Uint8Array): string {
  return convertBase64ToBase64url(convertUint8ArrayToBase64(uint8Array));
}

export {
  convertBase64urlToUint8Array,
  convertUint8ArrayToBase64url,
};
