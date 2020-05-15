import { makeJwt, Payload, Jose, JsonValue } from "./create.ts"
import { convertBase64urlToUint8Array } from "./base64/base64url.ts"
import { isExpired, isObject, has } from "./utils.ts"
import { encodeToString as convertUint8ArrayToHex } from "https://deno.land/std/encoding/hex.ts"

type JwtObject = { header: Jose; payload?: Payload; signature: string }
type Opts = { isThrowing: boolean; critHandlers?: Handlers }
type Handlers = {
  [key: string]: (header?: Jose[string]) => JsonValue | Promise<JsonValue>
}

// A present 'crit' header parameter indicates that the JWS signature validator
// must understand and process additional claims (JWS §4.1.11)
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
  maybeJwtObject: Record<keyof JwtObject, unknown>
): JwtObject {
  if (typeof maybeJwtObject.signature !== "string")
    throw ReferenceError("the signature is no string")
  if (
    !(
      isObject(maybeJwtObject.header) &&
      has("alg", maybeJwtObject.header) &&
      typeof maybeJwtObject.header.alg === "string"
    )
  )
    throw ReferenceError("header parameter 'alg' is not a string")
  if (isObject(maybeJwtObject.payload) && has("exp", maybeJwtObject.payload)) {
    if (typeof maybeJwtObject.payload.exp !== "number")
      throw RangeError("claim 'exp' is not a number")
    // Implementers MAY provide for some small leeway to account for clock skew (JWT §4.1.4)
    else if (isExpired(maybeJwtObject.payload.exp, 10000))
      throw RangeError("the jwt is expired")
  }
  return maybeJwtObject as JwtObject
}

async function handleJwtObject(
  jwtObject: JwtObject,
  critHandlers?: Handlers
): Promise<[JwtObject, JsonValue]> {
  return [
    jwtObject,
    "crit" in jwtObject.header
      ? await checkHeaderCrit(jwtObject.header, critHandlers)
      : null,
  ]
}

function parseAndDecode(jwt: string): Record<keyof JwtObject, unknown> {
  // throws runtime error if JWT serialization is invalid
  const parsedArray = jwt
    .match(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/)!
    .shift()!
    .split(".")
    .map(convertBase64urlToUint8Array)
    .map((uint8array, index) =>
      index === 2
        ? convertUint8ArrayToHex(uint8array)
        : JSON.parse(new TextDecoder().decode(uint8array))
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
  { isThrowing, critHandlers }: Opts = { isThrowing: true }
): Promise<JwtObject | null> {
  try {
    const [oldJwtObject] = await handleJwtObject(
      validateJwtObject(parseAndDecode(jwt)),
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

export {
  validateJwt,
  validateJwtObject,
  parseAndDecode,
  Jose,
  Payload,
  JwtObject,
  Opts,
}
