import { encode } from "https://deno.land/std/strings/mod.ts"
import { fromUint8Array as convertUint8ArrayToBase64 } from "https://denopkg.com/chiefbiiko/base64/mod.ts"
import { convertBase64ToBase64url } from "https://denopkg.com/timonson/base64url/base64url.ts"
import { hmac } from "https://denopkg.com/chiefbiiko/hmac/mod.ts"

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
      ? convertUint8ArrayToBase64(input)
      : convertUint8ArrayToBase64(
          inputEncoding === "hex"
            ? convertHexToUint8Array(input)
            : encode(input)
        )
  )
}

function convertHexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 || !/^[0-9a-fA-F]+$/.test(hex))
    throw new TypeError("Invalid hex string")
  return Uint8Array.from(
    [...hex].reduce((acc, el, i) => {
      i % 2 === 0
        ? (acc[acc.length] = el)
        : (acc[acc.length - 1] = parseInt(acc[acc.length - 1] + el, 16))
      return acc
    }, [])
  )
}

function makeJwsSigningInput(header: Jose, claims: Claims): string {
  return `${convertToBase64url(JSON.stringify(header))}.${convertToBase64url(
    JSON.stringify(claims)
  )}`
}

function makeSignature(
  alg: string,
  key: string | Uint8Array,
  msg: string | Uint8Array
): string {
  if (alg === "HS256")
    return convertToBase64url(hmac("sha256", key, msg, "utf8", "hex"), "hex")
  else if (alg === "HS512")
    return convertToBase64url(hmac("sha512", key, msg, "utf8", "hex"), "hex")
  else throw RangeError("no matching algorithm")
}

function makeJwt(header: Jose, claims: Claims, key: string): string {
  try {
    const signingInput: string = makeJwsSigningInput(header, claims)
    if (header.alg === "none") return `${signingInput}.`
    else
      return `${signingInput}.${makeSignature(header.alg, key, signingInput)}`
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
export { setExpiration, Claims, Jose }
