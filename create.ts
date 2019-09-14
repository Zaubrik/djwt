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

// §5.1 (JWS) Compute the encoded payload value BASE64URL(JWS Payload)
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts"
import { hmac } from "https://denopkg.com/chiefbiiko/hmac/mod.ts"

function makeBase64urlFromBase64(base64: string): string {
  return base64
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function makeB64urlEncodedString(
  input: string | Uint8Array,
  inputEncoding: string = "utf8"
): string {
  if (typeof input === "object")
    return makeBase64urlFromBase64(base64.fromUint8Array(input))
  const makeTypedArray =
    inputEncoding === "hex" ? createHexToTypedArray : createUtf8ToTypedArray
  return makeBase64urlFromBase64(base64.fromUint8Array(makeTypedArray(input)))
}

function createHexToTypedArray(hex: string): Uint8Array {
  if (typeof hex !== "string") throw new TypeError("Expected input to be a string")
  if (hex.length % 2 !== 0) throw new RangeError("String is not an even number long")
  var view = new Uint8Array(hex.length / 2)
  for (var i = 0; i < hex.length; i += 2)
    view[i / 2] = parseInt(hex.substring(i, i + 2), 16)

  return view
}

function createUtf8ToTypedArray(utf8: string): Uint8Array {
  return new TextEncoder().encode(utf8)
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
  throw new Error("no matching algorithm")
}

function makeJwt(headerObject: Jose, claims: Claims, key: string): string {
  try {
    const encodedHeader = makeB64urlEncodedString(JSON.stringify(headerObject))
    const encodedPayload = makeB64urlEncodedString(JSON.stringify(claims))
    const signingInput = makeJwsSigningInput(encodedHeader, encodedPayload)
    if (headerObject.alg === "none") return `${signingInput}.`
    const signature = makeSignature(headerObject.alg, key, signingInput)
    const encodedSignature = makeB64urlEncodedString(signature, "hex")
    return `${signingInput}.${encodedSignature}`
  } catch (err) {
    err.message = `Failed to create a JWT: ${err.message}`
    throw err
  }
}

export { makeJwt }
