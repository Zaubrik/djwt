import { encode } from "https://deno.land/std/strings/mod.ts"
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts"
import { hmac } from "https://denopkg.com/chiefbiiko/hmac/mod.ts"
import { convertBase64ToBase64url } from "https://denopkg.com/timonson/base64url/base64url.ts"

interface Claims {
  iss?: string
  sub?: string
  aud?: string[] | string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: any
}

interface Jose {
  alg: string
  crit?: string[]
  [key: string]: any
}

function convertToBase64url(
  input: string | Uint8Array,
  inputEncoding: string = "utf8"
): string {
  return convertBase64ToBase64url(
    typeof input === "object"
      ? base64.fromUint8Array(input)
      : base64.fromUint8Array(
          inputEncoding === "hex" ? convertHexToUint8Array(input) : encode(input)
        )
  )
}

function convertHexToUint8Array(hex: string): Uint8Array {
  if (typeof hex !== "string") throw new TypeError("Expected input to be a string")
  if (hex.length % 2 !== 0)
    throw new RangeError("String length is not an even number")
  const view = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2)
    view[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  return view
}

function makeJwsSigningInput(encodedHeader: string, encodedPayload: string): string {
  return `${encodedHeader}.${encodedPayload}`
}

function makeHmacSignature(
  hash: string,
  key: string | Uint8Array,
  msg: string | Uint8Array
): string | Uint8Array {
  return hmac(hash, key, msg, "utf8", "hex")
}

function makeSignature(
  alg: string,
  key: string | Uint8Array,
  msg: string | Uint8Array
): string | Uint8Array {
  if (alg === "HS256") return makeHmacSignature("sha256", key, msg)
  if (alg === "HS512") return makeHmacSignature("sha512", key, msg)
  throw new RangeError("no matching algorithm")
}

function makeJwt(headerObject: Jose, claims: Claims, key: string): string {
  try {
    const encodedHeader = convertToBase64url(JSON.stringify(headerObject))
    const encodedPayload = convertToBase64url(JSON.stringify(claims))
    const signingInput = makeJwsSigningInput(encodedHeader, encodedPayload)
    if (headerObject.alg === "none") return `${signingInput}.`
    const signature = makeSignature(headerObject.alg, key, signingInput)
    const encodedSignature = convertToBase64url(signature, "hex")
    return `${signingInput}.${encodedSignature}`
  } catch (err) {
    err.message = `Failed to create a JWT: ${err.message}`
    throw err
  }
}

export { makeJwt }
