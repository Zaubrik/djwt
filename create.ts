import { convertBase64ToBase64url } from "./base64/base64url.ts"
import { convertUint8ArrayToBase64 } from "./base64/base64.ts"
import { hmac } from "https://denopkg.com/chiefbiiko/hmac/mod.ts"

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonArray
type JsonObject = { [member: string]: JsonValue }
type JsonArray = JsonValue[]
type JwtObject = { header: Jose; payload: Claims | ""; signature: string }

interface Claims {
  iss?: string
  sub?: string
  aud?: string[] | string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: JsonValue | undefined
}

interface Jose {
  alg: string
  crit?: string[]
  [key: string]: JsonValue | undefined
}

function convertHexToBase64url(input: string): string {
  return convertBase64ToBase64url(
    convertUint8ArrayToBase64(convertHexToUint8Array(input))
  )
}

function convertStringToBase64url(input: string): string {
  return convertBase64ToBase64url(
    convertUint8ArrayToBase64(new TextEncoder().encode(input))
  )
}

function convertHexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)) {
    const match = hex.match(/.{2}/g)
    if (match) return Uint8Array.from(match.map(el => parseInt(el, 16)))
  }
  throw new TypeError("Invalid hex string.")
}

function makeJwsSigningInput(header: Jose, payload: Claims | string): string {
  return `${convertStringToBase64url(
    JSON.stringify(header)
  )}.${convertStringToBase64url(JSON.stringify(payload))}`
}

function makeSignature(
  alg: string,
  key: string | Uint8Array,
  msg: string | Uint8Array
): string | null {
  switch (alg) {
    case "none":
      return null
    case "HS256":
      return hmac("sha256", key, msg, "utf8", "hex") as string
    case "HS512":
      return hmac("sha512", key, msg, "utf8", "hex") as string
    default:
      throw RangeError("no matching algorithm")
  }
}

function makeJwt(
  header: JwtObject["header"],
  payload: JwtObject["payload"],
  key = ""
): string {
  try {
    const signingInput = makeJwsSigningInput(header, payload)
    const encryption = makeSignature(header.alg, key, signingInput)
    const signature: JwtObject["signature"] = encryption
      ? convertHexToBase64url(encryption)
      : ""
    return `${signingInput}.${signature}`
  } catch (err) {
    err.message = `Failed to create a JWT: ${err.message}`
    throw err
  }
}

/*
 * Helper function: setExpiration()
 * returns the number of milliseconds since January 1, 1970, 00:00:00 UTC
 */
function setExpiration(exp: number | Date): number {
  return (exp instanceof Date ? exp : new Date(exp)).getTime()
}

export default makeJwt
export {
  setExpiration,
  convertHexToBase64url,
  convertBase64ToBase64url,
  convertStringToBase64url,
  convertHexToUint8Array,
  Claims,
  Jose,
  JwtObject,
  JsonValue,
}
