import makeJwt, { setExpiration } from "../create.ts"
import validateJwt from "../validate.ts"
import { assertEquals } from "https://deno.land/std/testing/asserts.ts"

const key = "4%5 67_8$9"

Deno.test(async function makeSimpleCreationAndValidationTest(): Promise<void> {
  const claims = {
    iss: "joe",
    jti: "123456789abc",
    exp: setExpiration(new Date().getTime() + 1),
  }
  const headerObject1 = {
    alg: "HS512",
    crit: ["dummy"],
    dummy: 100,
  }
  const critHandlers1 = {
    dummy(value: any) {
      return value * 2
    },
  }
  const jwt = makeJwt(headerObject1, claims, key)
  if (!jwt) throw Error("something went wrong")
  const validatedjwt = await validateJwt(jwt, key, true, critHandlers1)
  if (typeof validatedjwt !== "object") throw Error("something went wrong")
  assertEquals(validatedjwt.payload, claims)
})

Deno.test(async function createJwtWithEmptyStringAsClaims(): Promise<void> {
  const claims = ""
  const headerObject2 = { typ: "JWT", alg: "none" }
  const jwt = makeJwt(headerObject2, claims)
  if (!jwt) throw Error("something went wrong")
  const validatedjwt = await validateJwt(jwt)
  if (typeof validatedjwt !== "object") throw Error("something went wrong")
  assertEquals(validatedjwt.payload, claims)
})

// await Deno.runTests()
