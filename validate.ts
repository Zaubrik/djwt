import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts"
import { addPaddingToBase64url } from "https://denopkg.com/timonson/base64url/base64url.ts"
import { makeJwt } from "./create.ts"

interface Jose {
  alg: string
  crit?: string[]
  [key: string]: any
}

interface CritHandlers {
  [key: string]: (header?: object) => any
}

/**
 * The "alg" (algorithm) Header Parameter identifies the cryptographic
 * algorithm used to secure the JWS
 * The 'alg' header MUST be present (JWS §4.1.1)
 */
function checkAlgHeaderParameter(joseHeader: Jose, algorithms: string[]): string {
  const algorithm = algorithms.find(el => el === joseHeader.alg)
  if (!algorithm) throw new RangeError("no or no matching algorithm in the header")
  return algorithm
}

/**
 * A present 'crit' header parameter indicates that the JWS signature validator must
 * understand and process additional claims (JWS §4.1.11)
 */
function checkCritHeaderParameter(
  joseHeader: Jose,
  critHandlers: CritHandlers
): Promise<any[]> {
  // prettier-ignore
  const reservedNames = new Set([ 
    "alg", "jku", "jwk", "kid", "x5u", "x5c", "x5t", "x5t#S256", "typ", "cty",
    "crit", "enc", "zip", "epk", "apu", "apv", "iv", "tag", "p2s", "p2c",
  ])

  if (
    !Array.isArray(joseHeader.crit) ||
    joseHeader.crit.some(str => typeof str !== "string" || !str)
  )
    throw new TypeError(
      '"crit" header parameter must be an array of non-empty strings'
    )
  if (joseHeader.crit.some(str => reservedNames.has(str)))
    throw new Error(`the 'crit' list contains a non-extension header parameter`)
  const activatedHandlers = joseHeader.crit
    .filter(str => typeof critHandlers[str] === "function")
    .map(str => critHandlers[str])
  if (activatedHandlers.length == 0)
    throw new Error("critical header extensions are not understood or supported")
  return Promise.all(activatedHandlers.map(handler => handler(joseHeader)))
}

function handleJoseHeader(
  joseHeader: Jose,
  algorithms: string[],
  critHandlers: CritHandlers
): [string, Promise<any[]>] {
  if (typeof joseHeader !== "object")
    throw new TypeError("the json header is no object")
  const algorithm: string = checkAlgHeaderParameter(joseHeader, algorithms)
  const criticalResults: Promise<any[]> =
    "crit" in joseHeader
      ? checkCritHeaderParameter(joseHeader, critHandlers)
      : Promise.resolve([])
  return [algorithm, criticalResults]
}

function convertUint8ArrayToHex(uint8Array: Uint8Array): string {
  return uint8Array.reduce((acc, el) => acc + ("0" + el.toString(16)).slice(-2), "")
}

function parseAndDecodeJwt(jwt: string): any[] {
  return (
    jwt
      .split(".")
      // base64 library doesn't add '=' padding to back base64url decoding
      .map(str => addPaddingToBase64url(str))
      .map((str, index) =>
        index === 2
          ? convertUint8ArrayToHex(base64.toUint8Array(str))
          : JSON.parse(new TextDecoder().decode(base64.toUint8Array(str)))
      )
  )
}

function validateJwt(
  jwt: string,
  key: string,
  throwErrors: boolean = true,
  criticalHandlers: CritHandlers = {}
) {
  try {
    const algorithms: string[] = ["HS256", "HS512", "none"]
    const [header, payload, signature] = parseAndDecodeJwt(jwt)
    const [algorithm, critResults] = handleJoseHeader(
      header,
      algorithms,
      criticalHandlers
    )
    const validationSignature = parseAndDecodeJwt(makeJwt(header, payload, key))[2]
    if (signature === validationSignature) return critResults
    throw new Error("signatures don't match")
  } catch (err) {
    err.message = `Invalid JWT: ${err.message}`
    if (throwErrors) throw err
  }
}

export default validateJwt
