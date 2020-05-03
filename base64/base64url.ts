import {
  convertBase64ToUint8Array,
  convertUint8ArrayToBase64,
} from "./base64.ts"

function addPaddingToBase64url(base64url: string): string {
  if (base64url.length % 4 === 2) return base64url + "=="
  if (base64url.length % 4 === 3) return base64url + "="
  if (base64url.length % 4 === 1)
    throw new TypeError("Illegal base64url string!")
  return base64url
}

function convertBase64urlToBase64(base64url: string): string {
  return addPaddingToBase64url(base64url).replace(/\-/g, "+").replace(/_/g, "/")
}

function convertBase64ToBase64url(base64: string): string {
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

function convertBase64urlToUint8Array(base64url: string): Uint8Array {
  return convertBase64ToUint8Array(convertBase64urlToBase64(base64url))
}

function convertUint8ArrayToBase64url(uint8Array: Uint8Array): string {
  return convertBase64ToBase64url(convertUint8ArrayToBase64(uint8Array))
}

export {
  convertBase64ToBase64url,
  convertBase64urlToBase64,
  addPaddingToBase64url,
  convertBase64urlToUint8Array,
  convertUint8ArrayToBase64url,
}
