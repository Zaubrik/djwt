import {
  makeJwt,
  setExpiration,
  makeSignature,
  convertHexToBase64url,
} from "../create.ts"
import { validateJwt, validateJwtObject, parseAndDecode } from "../validate.ts"
import {
  convertBase64urlToBase64,
  convertBase64ToBase64url,
} from "../base64/base64url.ts"
import {
  convertBase64ToUint8Array,
  convertUint8ArrayToBase64,
} from "../base64/base64.ts"
import {
  encodeToString as convertUint8ArrayToHex,
  decodeString as convertHexToUint8Array,
} from "https://deno.land/std/encoding/hex.ts"
import { assertEquals } from "https://deno.land/std/testing/asserts.ts"

const key = "your-secret"

Deno.test("makeConversionTest", function (): void {
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

Deno.test("makeSignatureTests", async function (): Promise<void> {
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

Deno.test("makeValidateJwtObjectTest", async function (): Promise<void> {
  const header = {
    alg: "HS256" as const,
    typ: "JWT",
  }
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    iat: 1516239022,
  }
  const signature = "SARsBE5x_ua2ye823r2zKpQNaew3Daq8riKz5A4h3o4"
  const jwtObject = validateJwtObject({
    header,
    payload,
    signature,
  })
  assertEquals(jwtObject!.payload, payload)

  try {
    const jwtObject = validateJwtObject({
      header: {
        alg: 10,
        typ: "JWT",
      },
      payload,
      signature,
    })
  } catch (err) {
    assertEquals(err.message, "header parameter 'alg' is not a string")
  }
})

Deno.test("parseAndDecodeTests", function (): void {
  try {
    const r1 = parseAndDecode(".aaa.bbb")
  } catch (err) {
    assertEquals(err instanceof TypeError, true)
  }
  try {
    const r2 = parseAndDecode(".aaa.bbb")
  } catch (err) {
    assertEquals(err instanceof TypeError, true)
  }
  try {
    const r3 = parseAndDecode("a..aa.bbb")
  } catch (err) {
    assertEquals(err instanceof TypeError, true)
  }
  try {
    const r4 = parseAndDecode("aaa.bbb.ccc.")
  } catch (err) {
    assertEquals(err instanceof TypeError, true)
  }
  const jwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  const header = {
    alg: "HS256" as const,
    typ: "JWT",
  }
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    iat: 1516239022,
  }
  assertEquals(parseAndDecode(jwt), {
    header,
    payload,
    signature:
      "49f94ac7044948c78a285d904f87f0a4c7897f7e8f3a4eb2255fda750b2cc397",
  })
  assertEquals(makeJwt({ header, payload, key: "your-256-bit-secret" }), jwt)
})

Deno.test("makeCreationAndValidationTest", async function (): Promise<void> {
  const header = {
    alg: "HS256" as const,
    typ: "JWT",
  }
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    iat: 1516239022,
  }
  const jwt = makeJwt({ header, payload, key })
  const validatedJwt = await validateJwt(jwt, key)
  assertEquals(
    jwt,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SARsBE5x_ua2ye823r2zKpQNaew3Daq8riKz5A4h3o4"
  )
  assertEquals(validatedJwt!.payload, payload)
  assertEquals(validatedJwt!.header, header)
  assertEquals(
    jwt.slice(jwt.lastIndexOf(".") + 1),
    convertHexToBase64url(validatedJwt!.signature)
  )

  const invalidJwt = // jwt with not supported crypto algorithm in alg header:
    "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.bQTnz6AuMJvmXXQsVPrxeQNvzDkimo7VNXxHeSBfClLufmCVZRUuyTwJF311JHuh"
  try {
    const validatedJwt = await validateJwt(invalidJwt, "")
  } catch (err) {
    assertEquals(
      err.message,
      "Invalid JWT: Failed to create a JWT: no matching crypto algorithm in the header: HS384"
    )
  }
})

Deno.test("testExpiredJwt", async function (): Promise<void> {
  const payload = {
    iss: "joe",
    jti: "123456789abc",
    exp: setExpiration(new Date().getTime() - 20000),
  }
  const header = {
    alg: "HS256" as const,
    dummy: 100,
  }
  const jwt = makeJwt({ header, payload, key })
  try {
    const validatedJwt = await validateJwt(jwt, key)
  } catch (err) {
    assertEquals(err.message, "Invalid JWT: the jwt is expired")
  }
})

Deno.test("makeHeaderCritTest", async function (): Promise<void> {
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

  const jwt = makeJwt({ header, payload, key })
  const validatedJwt = await validateJwt(jwt, key, {
    critHandlers,
    isThrowing: true,
  })
  assertEquals(validatedJwt!.payload, payload)
  assertEquals(validatedJwt!.header, header)
  assertEquals(
    jwt.slice(jwt.lastIndexOf(".") + 1),
    convertHexToBase64url(validatedJwt!.signature)
  )
  try {
    const failing = await validateJwt(jwt, key)
  } catch (err) {
    assertEquals(
      err.message,
      "Invalid JWT: critical extension header parameters are not understood"
    )
  }
})

// https://tools.ietf.org/html/rfc7519#section-6
Deno.test("makeUnsecuredJwtTest", async function (): Promise<void> {
  const payload = {
    iss: "joe",
    jti: "123456789abc",
  }
  const header = {
    alg: "none" as const,
    dummy: 100,
  }
  const jwt = makeJwt({ header, payload, key })
  const validatedJwt = await validateJwt(jwt, "keyIsIgnored")
  assertEquals(validatedJwt!.payload, payload)
  assertEquals(validatedJwt!.header, header)
  assertEquals(validatedJwt!.signature, "")
})

// https://www.rfc-editor.org/rfc/rfc7515.html#appendix-F
Deno.test("createJwtWithEmptyPayloadTest", async function (): Promise<void> {
  const header = { typ: "JWT", alg: "HS256" as const }
  const jwt = makeJwt({ header, key })
  const validatedJwt = await validateJwt(jwt, key)
  assertEquals(validatedJwt!.payload, undefined)
  assertEquals(validatedJwt!.header, header)
})

// await Deno.runTests()
