import makeJwt, {
  Payload,
  Jose,
  JwtObject,
  JsonValue,
  Algorithm,
  ALGORITHMS,
} from "./create.ts"
import { convertBase64ToUint8Array } from "./base64/base64.ts"
import { convertBase64urlToBase64 } from "./base64/base64url.ts"

interface Handlers {
  [key: string]: (header?: Jose[string]) => any
}

/*
 * The "alg" header parameter identifies the cryptographic algorithm and MUST
 * be present (JWS §4.1.1)
 */
function checkHeaderAlg(header: Jose, algorithms:ALGORITHMS): Algorithm {
  if (!header.alg) throw ReferenceError("header parameter 'alg' is empty")
  const algorithm = algorithms[header.alg as Algorithm]
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
    header.crit.some((str: string) => typeof str !== "string" || !str)
  )
    throw Error("header parameter 'crit' must be an array of non-empty strings")
  if (header.crit.some((str: string) => reservedNames.has(str)))
    throw Error("the 'crit' list contains a non-extension header parameter")
  if (
    header.crit.some(
      (str: string) => !header[str] || typeof critHandlers[str] !== "function"
    )
  )
    throw Error("critical extension header parameters are not understood")
  return Promise.all(
    header.crit.map((str: string) => critHandlers[str](header[str]))
  )
}

/*
 * Implementers MAY provide for some small leeway to account for clock skew (JWT §4.1.4)
 */
function isExpired(exp: number): boolean {
  return new Date(exp + 10000) < new Date()
}

function validateAndHandleHeaders(
  header: Jose,
  algorithms: ALGORITHMS,
  critHandlers: Handlers
): Promise<any> {
  if ("exp" in header) {
    if (typeof header.exp !== "number" || !isExpired(header.exp))
      throw RangeError("the jwt is expired")
  }
  return checkHeaderAlg(header, algorithms) && "crit" in header
    ? checkHeaderCrit(header, critHandlers)
    : Promise.resolve()
}

function convertUint8ArrayToHex(uint8Array: Uint8Array): string {
  return uint8Array.reduce(
    (acc, el) => acc + el.toString(16).padStart(2, "0"),
    ""
  )
}

function parseAndDecode(jwt: string): JwtObject {
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/.test(jwt))
    throw Error("wrong type or format")
  const parsedArray = jwt
    .split(".")
    .map(convertBase64urlToBase64)
    .map((str, index) => {
      return index === 2
        ? convertUint8ArrayToHex(convertBase64ToUint8Array(str))
        : JSON.parse(new TextDecoder().decode(convertBase64ToUint8Array(str)))
    })
  return {
    header: parsedArray[0],
    payload: parsedArray[1],
    signature: parsedArray[2],
  } as JwtObject
}

async function validateJwt(
  jwt: string,
  key = "",
  throwErrors = true,
  critHandlers: Handlers = {}
): Promise<JwtObject | undefined> {
  try {
    const oldJwt = parseAndDecode(jwt)
    await validateAndHandleHeaders(oldJwt.header, ALGORITHMS, critHandlers)
    const signature = parseAndDecode(
      makeJwt(oldJwt.header, oldJwt.payload, key)
    ).signature
    if (oldJwt.signature === signature) return oldJwt
    else throw Error("signatures don't match")
  } catch (err) {
    err.message = `Invalid JWT: ${err.message}`
    if (throwErrors) throw err
  }
}

export default validateJwt
export { convertUint8ArrayToHex,Jose,Payload }
