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
          inputEncoding === "hex"
            ? convertHexToUint8Array(input)
            : encode(input)
        )
  )
}

function convertHexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0)
    throw new RangeError("String length is not an even number")
  return Uint8Array.from(
    [...hex].reduce((acc, el, i) => {
      i % 2 === 0
        ? (acc[acc.length] = el)
        : (acc[acc.length - 1] = parseInt(
            acc[acc.length - 1] + el.toString(),
            16
          ))
      return acc
    }, [])
  )
}

function makeJwsSigningInput(
  encodedHeader: string,
  encodedPayload: string
): string {
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
  throw RangeError("no matching algorithm")
}

// Helper function: setExpiration()
// returns the number of milliseconds since January 1, 1970, 00:00:00 UTC
// Examples:
// A specific date: setExpiration(new Date('2020-07-01'));
// One hour from now: setExpiration(new Date().getTime() + (60*60*1000));
function setExpiration(exp: number | Date): number {
  return (exp instanceof Date ? exp : new Date(exp)).getTime()
}

function makeJwt(
  headerObject: Jose,
  claims: Claims, // | string = "",
  key: string
): string {
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

export default makeJwt
export { setExpiration, Claims, Jose }
