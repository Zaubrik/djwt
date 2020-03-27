import makeJwt, {
  setExpiration,
  convertHexToBase64url,
  convertBase64ToBase64url,
  convertHexToUint8Array,
} from "../create.ts"
import validateJwt from "../validate.ts"
import { convertUint8ArrayToHex } from "../validate.ts"
import { convertBase64urlToBase64 } from "../base64/base64url.ts"
import {
  convertBase64ToUint8Array,
  convertUint8ArrayToBase64,
} from "../base64/base64.ts"
import { assertEquals } from "https://deno.land/std/testing/asserts.ts"

const key = "your-secret"

Deno.test(function makeSimpleCreationAndValidationTest(): void {
  const hex1 =
    "a4a99a8e21149ccbc5c5aabd310e5d5208b12db90dff749171d5014b688ce808"
  const hex2 = convertUint8ArrayToHex(
    convertBase64ToUint8Array(
      convertBase64urlToBase64(
        convertBase64ToBase64url(
          convertUint8ArrayToBase64(
            convertHexToUint8Array(
              convertUint8ArrayToHex(
                convertBase64ToUint8Array(
                  convertBase64urlToBase64(convertHexToBase64url(hex1))
                )
              )
            )
          )
        )
      )
    )
  )
  assertEquals(hex1, hex2)
})

Deno.test(async function makeSimpleCreationAndValidationTest(): Promise<void> {
  const claims = {
    iss: "joe",
    jti: "123456789abc",
    exp: setExpiration(new Date().getTime() + 1),
  }
  const headerObject = {
    alg: "HS256",
    crit: ["dummy"],
    dummy: 100,
  }
  const critHandlers = {
    dummy(value: any) {
      return value * 2
    },
  }

  const jwt = makeJwt(headerObject, claims, key)
  const validatedJwt = await validateJwt(jwt, key, true, critHandlers)
  assertEquals(validatedJwt!.payload, claims)
  assertEquals(validatedJwt!.header, headerObject)
  assertEquals(
    jwt.slice(jwt.lastIndexOf(".") + 1),
    convertHexToBase64url(validatedJwt!.signature)
  )
})

// https://tools.ietf.org/html/rfc7519#section-6
Deno.test(async function makeUnsecuredJwtTest(): Promise<void> {
  const claims = {
    iss: "joe",
    jti: "123456789abc",
    exp: setExpiration(new Date().getTime() + 1),
  }
  const headerObject = {
    alg: "none",
    dummy: 100,
  }
  const jwt = makeJwt(headerObject, claims)
  const validatedJwt = await validateJwt(jwt)
  assertEquals(validatedJwt!.payload, claims)
  assertEquals(validatedJwt!.header, headerObject)
  assertEquals(validatedJwt!.signature, "")
})

// https://www.rfc-editor.org/rfc/rfc7515.html#appendix-F
Deno.test(async function createJwtWithEmptyPayload(): Promise<void> {
  const claims = ""
  const headerObject = { typ: "JWT", alg: "HS256" }
  const jwt = makeJwt(headerObject, claims, key)
  const validatedJwt = await validateJwt(jwt, key)
  assertEquals(validatedJwt!.payload, claims)
  assertEquals(validatedJwt!.header, headerObject)
})

// await Deno.runTests()
