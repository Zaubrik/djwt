import makeJwt, { Payload, Jose, JsonValue } from "./create.ts"
import { convertBase64ToUint8Array } from "./base64/base64.ts"
import { convertBase64urlToBase64 } from "./base64/base64url.ts"
import { encodeToString as convertUint8ArrayToHex } from "https://deno.land/std/encoding/hex.ts"

type JwtObject = { header: Jose; payload?: Payload; signature: string }
type Handlers = {
  [key: string]: (header?: Jose[string]) => JsonValue | Promise<JsonValue>
}

/*
 * Implementers MAY provide for some small leeway to account for clock skew (JWT §4.1.4)
 */
function isExpired(exp: number, cushion = 10000): boolean {
  return new Date(exp + cushion) < new Date()
}

function isObject(obj: unknown): obj is object {
  return obj !== null && typeof obj === "object" && Array.isArray(obj) === false
}

function has<K extends string>(
  key: K,
  x: object
): x is { [key in K]: unknown } {
  return key in x
}

/*
 * A present 'crit' header parameter indicates that the JWS signature validator
 * must understand and process additional claims (JWS §4.1.11)
 */
function checkHeaderCrit(
  header: Jose,
  handlers?: Handlers
): Promise<JsonValue[]> {
  function checkCritHeaderValidity(
    critOrNothing: Jose["crit"]
  ): Required<Jose>["crit"] {
    if (
      !Array.isArray(critOrNothing) ||
      critOrNothing.some((str: string) => typeof str !== "string" || !str)
    )
      throw Error(
        "header parameter 'crit' must be an array of non-empty strings"
      )
    else return critOrNothing
  }

  function checkReservedWords(crit: Required<Jose>["crit"]) {
    // prettier-ignore
    if (crit.some((str: string) => new Set([ 
    "alg", "jku", "jwk", "kid", "x5u", "x5c", "x5t", "x5t#S256", "typ", "cty",
    "crit", "enc", "zip", "epk", "apu", "apv", "iv", "tag", "p2s", "p2c",
  ]).has(str)))
    throw Error("the 'crit' list contains a non-extension header parameter")
    else return crit
  }

  function checkCritHandlers(
    crit: Required<Jose>["crit"],
    handlers?: Handlers
  ): [Required<Jose>["crit"], Handlers] {
    if (
      !handlers ||
      crit.some(
        (str: string) => !header[str] || typeof handlers[str] !== "function"
      )
    )
      throw Error("critical extension header parameters are not understood")
    else return [crit, handlers]
  }

  function executeCritHandlers([crit, handlers]: [
    Required<Jose>["crit"],
    Handlers
  ]) {
    return Promise.all(crit.map((str: string) => handlers[str](header[str])))
  }
  return executeCritHandlers(
    checkCritHandlers(
      checkReservedWords(checkCritHeaderValidity(header.crit)),
      handlers
    )
  )
}

function validateJwtObject(
  jwtObject: Record<keyof JwtObject, unknown>
): JwtObject {
  if (typeof jwtObject.signature !== "string")
    throw ReferenceError("the signature is no string")
  if (
    !(
      isObject(jwtObject.header) &&
      has("alg", jwtObject.header) &&
      typeof jwtObject.header.alg === "string"
    )
  )
    throw ReferenceError("header parameter 'alg' is empty")
  if (isObject(jwtObject.payload) && has("exp", jwtObject.payload)) {
    if (typeof jwtObject.payload.exp !== "number")
      throw RangeError("claim 'exp' is not a number")
    else if (isExpired(jwtObject.payload.exp))
      throw RangeError("the jwt is expired")
  }
  return jwtObject as JwtObject
}

async function validateAndHandleHeaders(
  jwtObject: Record<keyof JwtObject, unknown>,
  critHandlers?: Handlers
): Promise<[JwtObject, JsonValue]> {
  const validatedJwtObj = validateJwtObject(jwtObject)
  return [
    validatedJwtObj,
    "crit" in validatedJwtObj.header
      ? await checkHeaderCrit(validatedJwtObj.header, critHandlers)
      : null,
  ]
}

function parseAndDecode(jwt: string): Record<keyof JwtObject, unknown> {
  // throws error if JWT serialization is invalid
  const parsedArray = jwt
    .match(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/)!
    .shift()!
    .split(".")
    .map(convertBase64urlToBase64)
    .map(convertBase64ToUint8Array)
    .map((str, index) =>
      index === 2
        ? convertUint8ArrayToHex(str)
        : JSON.parse(new TextDecoder().decode(str))
    )
  return {
    header: parsedArray[0],
    payload: parsedArray[1] === "" ? undefined : parsedArray[1],
    signature: parsedArray[2],
  }
}

async function validateJwt(
  jwt: string,
  key: string,
  isThrowing = true,
  critHandlers?: Handlers
): Promise<JwtObject | null> {
  try {
    const [oldJwtObject] = await validateAndHandleHeaders(
      parseAndDecode(jwt),
      critHandlers
    )
    if (
      oldJwtObject.signature ===
      parseAndDecode(makeJwt({ ...oldJwtObject, key })).signature
    )
      return oldJwtObject
    else throw Error("signatures don't match")
  } catch (err) {
    err.message = `Invalid JWT: ${err.message}`
    if (isThrowing) throw err
    else return null
  }
}

export default validateJwt
export { parseAndDecode, Jose, Payload, JwtObject }
