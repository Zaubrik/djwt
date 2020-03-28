import makeJwt, {
  setExpiration,
  makeSignature,
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

Deno.test(function makeConversionTest(): void {
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

Deno.test(async function makeSignatureTests(): Promise<void> {
  // https://www.freeformatter.com/hmac-generator.html
  const computedHmacInHex =
    "2b9e6619fa7f2c8d8b3565c88365376b75b1b0e5d87e41218066fd1986f2c056"
  const anotherVerifiedSignatureInBase64Url =
    "p2KneqJhji8T0PDlVxcG4DROyzTgWXbDhz_mcTVojXo"
  assertEquals(
    makeSignature("HS256", "m$y-key", "thisTextWillBeEncrypted"),
    convertHexToBase64url(computedHmacInHex)
  )
  assertEquals(
    makeSignature(
      "HS256",
      "m$y-key",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
    ),
    anotherVerifiedSignatureInBase64Url
  )
})

Deno.test(async function makeSimpleValidationTest(): Promise<void> {
  const header = {
    alg: "HS384",
    typ: "JWT",
  }
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  }
  const jwt =
    "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.bQTnz6AuMJvmXXQsVPrxeQNvzDkimo7VNXxHeSBfClLufmCVZRUuyTwJF311JHuh"
  try {
    const validatedJwt = await validateJwt(jwt)
  } catch (err) {
    assertEquals(
      err.message,
      "Invalid JWT: Failed to create a JWT: no matching crypto algorithm in the header: HS384"
    )
  }
})

Deno.test(async function testExpiredJwt(): Promise<void> {
  const payload = {
    iss: "joe",
    jti: "123456789abc",
    exp: setExpiration(new Date().getTime() - 20000),
  }
  const header = {
    alg: "HS256" as const,
    dummy: 100,
  }
  const jwt = makeJwt({ header, payload }, key)
  try {
    const validatedJwt = await validateJwt(jwt, key)
  } catch (err) {
    assertEquals(err.message, "Invalid JWT: the jwt is expired")
  }
})

Deno.test(async function makeSimpleCreationAndValidationTest(): Promise<void> {
  const payload = {
    iss: "joe",
    jti: "123456789abc",
    exp: setExpiration(new Date().getTime() + 1),
  }
  const header = {
    alg: "HS256" as const,
    crit: ["dummy"],
    dummy: 100,
  }
  const critHandlers = {
    dummy(value: any) {
      return value * 2
    },
  }

  const jwt = makeJwt({ header, payload }, key)
  const validatedJwt = await validateJwt(jwt, key, true, critHandlers)
  assertEquals(validatedJwt!.payload, payload)
  assertEquals(validatedJwt!.header, header)
  assertEquals(
    jwt.slice(jwt.lastIndexOf(".") + 1),
    convertHexToBase64url(validatedJwt!.signature)
  )
})

// https://tools.ietf.org/html/rfc7519#section-6
Deno.test(async function makeUnsecuredJwtTest(): Promise<void> {
  const payload = {
    iss: "joe",
    jti: "123456789abc",
  }
  const header = {
    alg: "none" as const,
    dummy: 100,
  }
  const jwt = makeJwt({ header, payload })
  const validatedJwt = await validateJwt(jwt)
  assertEquals(validatedJwt!.payload, payload)
  assertEquals(validatedJwt!.header, header)
  assertEquals(validatedJwt!.signature, "")
})

// https://www.rfc-editor.org/rfc/rfc7515.html#appendix-F
Deno.test(async function createJwtWithEmptyPayload(): Promise<void> {
  const header = { typ: "JWT", alg: "HS256" as const }
  const jwt = makeJwt({ header }, key)
  const validatedJwt = await validateJwt(jwt, key)
  assertEquals(validatedJwt!.payload, undefined)
  assertEquals(validatedJwt!.header, header)
})

// await Deno.runTests()
