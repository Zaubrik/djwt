import { toUint8Array as base64ToUint8Array } from "https://denopkg.com/chiefbiiko/base64/mod.ts"
import { addPaddingToBase64url } from "https://denopkg.com/timonson/base64url/base64url.ts"
import makeJwt, { Claims, Jose } from "./create.ts"

interface CritHandlers {
  [key: string]: (header?: any) => any
}

/*
 * The "alg" (algorithm) Header Parameter identifies the cryptographic
 * algorithm used to secure the JWS
 * The 'alg' header MUST be present (JWS §4.1.1)
 */
function checkAlgHeaderParameter(
  joseHeader: Jose,
  algorithms: string[]
): string {
  const algorithm = algorithms.find(el => el === joseHeader.alg)
  if (!algorithm) throw RangeError("no or no matching algorithm in the header")
  return algorithm
}

/*
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
    throw TypeError(
      '"crit" header parameter must be an array of non-empty strings'
    )
  if (joseHeader.crit.some(str => reservedNames.has(str)))
    throw Error(`the 'crit' list contains a non-extension header parameter`)
  const activatedHandlers = joseHeader.crit
    .filter(str => typeof critHandlers[str] === "function")
    .map(str => joseHeader => critHandlers[str](joseHeader[str]))
  if (activatedHandlers.length !== joseHeader.crit.length)
    throw Error("critical extension header parameters are not understood")
  return Promise.all(activatedHandlers.map(handler => handler(joseHeader)))
}

function handleJoseHeader(
  joseHeader: Jose,
  algorithms: string[],
  critHandlers: CritHandlers
): [string, Promise<any[]>] {
  if (typeof joseHeader !== "object")
    throw TypeError("the json header is no object")
  const algorithm: string = checkAlgHeaderParameter(joseHeader, algorithms)
  const criticalResults: Promise<any[]> =
    "crit" in joseHeader
      ? checkCritHeaderParameter(joseHeader, critHandlers)
      : Promise.resolve([])
  return [algorithm, criticalResults]
}

function convertUint8ArrayToHex(uint8Array: Uint8Array): string {
  return uint8Array.reduce(
    (acc, el) => acc + ("0" + el.toString(16)).slice(-2),
    ""
  )
}

function parseAndDecodeJwt(jwt: string): any[] {
  return (
    jwt
      .split(".")
      // base64 library doesn't add '=' padding back to base64url decoding
      .map(str => addPaddingToBase64url(str))
      .map((str, index) =>
        index === 2
          ? convertUint8ArrayToHex(base64ToUint8Array(str))
          : JSON.parse(new TextDecoder().decode(base64ToUint8Array(str)))
      )
  )
}

function checkIfExpired(exp: number): void {
  if (new Date(exp) < new Date()) throw RangeError("the jwt is expired")
}

function validateJwt(
  jwt: string,
  key: string,
  throwErrors: boolean = true,
  criticalHandlers: CritHandlers = {}
): Promise<any[]> | void {
  try {
    if (typeof jwt !== "string" || !jwt.includes("."))
      throw Error("wrong type or format")
    const algorithms: string[] = ["HS256", "HS512", "none"]
    const [header, payload, signature] = parseAndDecodeJwt(jwt) as [
      Jose,
      Claims,
      string
    ]
    const [algorithm, critResults] = handleJoseHeader(
      header,
      algorithms,
      criticalHandlers
    )
    if (payload && payload.exp) checkIfExpired(payload.exp)
    const validationSignature = parseAndDecodeJwt(
      makeJwt(header, payload, key)
    )[2]
    if (signature === validationSignature) return critResults
    throw Error("signatures don't match")
  } catch (err) {
    err.message = `Invalid JWT: ${err.message}`
    if (throwErrors) throw err
  }
}

export default validateJwt
