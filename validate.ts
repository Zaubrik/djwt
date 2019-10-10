import { toUint8Array as convertBase64ToUint8Array } from "https://denopkg.com/chiefbiiko/base64/mod.ts"
import { addPaddingToBase64url } from "https://denopkg.com/timonson/base64url/base64url.ts"
import makeJwt, { Claims, Jose } from "./create.ts"

interface CritHandlers {
  [key: string]: (header?: any) => any
}

/*
 * The "alg" (algorithm) Header Parameter identifies the cryptographic algorithm
 * The 'alg' header MUST be present (JWS §4.1.1)
 */
function checkAlgHeaderParameter(header: Jose, algorithms: string[]): string {
  const algorithm = algorithms.find(el => el === header.alg)
  if (!algorithm) throw RangeError("no or no matching algorithm in the header")
  return algorithm
}

/*
 * A present 'crit' header parameter indicates that the JWS signature validator
 * must understand and process additional claims (JWS §4.1.11)
 */
function checkCritHeaderParameter(
  header: Jose,
  critHandlers: CritHandlers
): Promise<any[]> {
  // prettier-ignore
  const reservedNames = new Set([ 
    "alg", "jku", "jwk", "kid", "x5u", "x5c", "x5t", "x5t#S256", "typ", "cty",
    "crit", "enc", "zip", "epk", "apu", "apv", "iv", "tag", "p2s", "p2c",
  ])

  if (
    !Array.isArray(header.crit) ||
    header.crit.some(str => typeof str !== "string" || !str)
  )
    throw TypeError(
      '"crit" header parameter must be an array of non-empty strings'
    )
  if (header.crit.some(str => reservedNames.has(str)))
    throw Error(`the 'crit' list contains a non-extension header parameter`)
  const activatedHandlers = header.crit
    .filter(str => typeof critHandlers[str] === "function")
    .map(str => header => critHandlers[str](header[str]))
  if (activatedHandlers.length !== header.crit.length)
    throw Error("critical extension header parameters are not understood")
  return Promise.all(activatedHandlers.map(handler => handler(header)))
}

function handleHeader(
  header: Jose,
  algorithms: string[],
  critHandlers: CritHandlers
): [string, Promise<any[]>] {
  if (typeof header !== "object")
    throw TypeError("the json header is no object")
  const algorithm: string = checkAlgHeaderParameter(header, algorithms)
  const critResults: Promise<any[]> =
    "crit" in header
      ? checkCritHeaderParameter(header, critHandlers)
      : Promise.resolve([])
  return [algorithm, critResults]
}

function convertUint8ArrayToHex(uint8Array: Uint8Array): string {
  return uint8Array.reduce(
    (acc, el) => acc + el.toString(16).padStart(2, "0"),
    ""
  )
}

function parseDecode(jwt: string): [Jose, Claims, string] {
  return (
    jwt
      .split(".")
      // base64 library doesn't add '=' padding back to base64url decoding
      .map(str => addPaddingToBase64url(str))
      .map((str, index) =>
        index === 2
          ? convertUint8ArrayToHex(convertBase64ToUint8Array(str))
          : JSON.parse(new TextDecoder().decode(convertBase64ToUint8Array(str)))
      ) as [Jose, Claims, string]
  )
}

function checkIfExpired(exp: number): void {
  if (new Date(exp) < new Date()) throw RangeError("the jwt is expired")
}

function validateJwt(
  jwt: string,
  key: string,
  throwErrors: boolean = true,
  critHandlers: CritHandlers = {}
): Promise<any[]> | void {
  const algorithms: string[] = ["HS256", "HS512", "none"]
  try {
    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/.test(jwt))
      throw Error("wrong type or format")
    const [header, payload, oldSig] = parseDecode(jwt)
    const [alg, critResults] = handleHeader(header, algorithms, critHandlers)
    if (payload && payload.exp) checkIfExpired(payload.exp)
    const newSig = parseDecode(makeJwt(header, payload, key))[2]
    if (oldSig === newSig) return critResults
    else throw Error("signatures don't match")
  } catch (err) {
    err.message = `Invalid JWT: ${err.message}`
    if (throwErrors) throw err
  }
}

export default validateJwt
