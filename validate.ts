import { toUint8Array as convertBase64ToUint8Array } from "https://denopkg.com/chiefbiiko/base64/mod.ts"
import { addPaddingToBase64url } from "https://denopkg.com/timonson/base64url/base64url.ts"
import makeJwt, { Claims, Jose } from "./create.ts"

interface Handlers {
  [key: string]: (header?: any) => any
}

/*
 * The "alg" header parameter identifies the cryptographic algorithm and MUST
 * be present (JWS §4.1.1)
 */
function checkHeaderAlg(header: Jose, algorithms: string[]): string {
  if (!header.alg) throw ReferenceError("header parameter 'alg' is empty")
  const algorithm = algorithms.find(el => el === header.alg)
  if (!algorithm) throw RangeError("no matching crypto algorithm in the header")
  return algorithm
}

/*
 * A present 'crit' header parameter indicates that the JWS signature validator
 * must understand and process additional claims (JWS §4.1.11)
 */
function checkHeaderCrit(header: Jose, critHandlers: Handlers): Promise<any[]> {
  // prettier-ignore
  const reservedNames = new Set([ 
    "alg", "jku", "jwk", "kid", "x5u", "x5c", "x5t", "x5t#S256", "typ", "cty",
    "crit", "enc", "zip", "epk", "apu", "apv", "iv", "tag", "p2s", "p2c",
  ])
  if (
    !Array.isArray(header.crit) ||
    header.crit.some(str => typeof str !== "string" || !str)
  )
    throw Error("header parameter 'crit' must be an array of non-empty strings")
  if (header.crit.some(str => reservedNames.has(str)))
    throw Error("the 'crit' list contains a non-extension header parameter")
  if (header.crit.some(str => typeof critHandlers[str] !== "function"))
    throw Error("critical extension header parameters are not understood")
  return Promise.all(header.crit.map(str => critHandlers[str](header[str])))
}

function handleHeader(
  header: Jose,
  algorithms: string[],
  critHandlers: Handlers
): [string, Promise<any[]>] {
  const algorithm: string = checkHeaderAlg(header, algorithms)
  const critResults: Promise<any[]> =
    "crit" in header
      ? checkHeaderCrit(header, critHandlers)
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
  critHandlers: Handlers = {}
): Promise<any[]> | void {
  const algorithms: string[] = ["HS256", "HS512", "none"]
  try {
    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/.test(jwt))
      throw Error("wrong type or format")
    const [header, payload, oldSig] = parseDecode(jwt)
    if (payload && payload.exp) checkIfExpired(payload.exp)
    const [alg, critResults] = handleHeader(header, algorithms, critHandlers)
    const newSig = parseDecode(makeJwt(header, payload, key))[2]
    if (oldSig === newSig) return critResults
    else throw Error("signatures don't match")
  } catch (err) {
    err.message = `Invalid JWT: ${err.message}`
    if (throwErrors) throw err
  }
}

export default validateJwt
