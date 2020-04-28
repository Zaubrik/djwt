import makeJwt, { Payload, Jose } from "./create.ts"
import { convertBase64ToUint8Array } from "./base64/base64.ts"
import { convertBase64urlToBase64 } from "./base64/base64url.ts"
import { encodeToString as convertUint8ArrayToHex } from "https://deno.land/std/encoding/hex.ts"

type JwtObject = { header: Jose; payload?: Payload; signature: string }
type Handlers = {
  [key: string]: (header?: Jose[string]) => any
}

/*
 * A present 'crit' header parameter indicates that the JWS signature validator
 * must understand and process additional claims (JWS §4.1.11)
 */
function checkHeaderCrit(header: Jose, handlers?: Handlers): Promise<any[]> {
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
    !handlers ||
    header.crit.some(
      (str: string) => !header[str] || typeof handlers[str] !== "function"
    )
  )
    throw Error("critical extension header parameters are not understood")
  return Promise.all(
    header.crit.map((str: string) => handlers[str](header[str]))
  )
}

/*
 * Implementers MAY provide for some small leeway to account for clock skew (JWT §4.1.4)
 */
function isExpired(exp: Payload["exp"]): boolean {
  if (typeof exp !== "number" || new Date(exp + 10000) < new Date()) return true
  else return false
}

function validateAndHandleHeaders(
  { header, payload }: JwtObject,
  critHandlers?: Handlers
): Promise<any> {
  if (!header.alg) throw ReferenceError("header parameter 'alg' is empty")
  if (typeof payload === "object" && "exp" in payload && isExpired(payload.exp))
    throw RangeError("the jwt is expired")
  return "crit" in header
    ? checkHeaderCrit(header, critHandlers)
    : Promise.resolve()
}

function parseAndDecode(jwt: string): JwtObject {
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/.test(jwt))
    throw Error("no valid JWT serialization")
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
    payload: parsedArray[1] === "" ? undefined : parsedArray[1],
    signature: parsedArray[2],
  } as JwtObject
}

async function validateJwt(
  jwt: string,
  key: string,
  isThrowing = true,
  critHandlers?: Handlers
): Promise<JwtObject | null> {
  try {
    const oldJwtObject = parseAndDecode(jwt)
    await validateAndHandleHeaders(oldJwtObject, critHandlers)
    const signature = parseAndDecode(makeJwt(oldJwtObject, key)).signature
    if (oldJwtObject.signature === signature) return oldJwtObject
    else throw Error("signatures don't match")
  } catch (err) {
    err.message = `Invalid JWT: ${err.message}`
    if (isThrowing) throw err
    else return null
  }
}

export default validateJwt
export { convertUint8ArrayToHex, Jose, Payload }
