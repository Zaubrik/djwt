import makeJwt, { setExpiration } from "https://deno.land/x/djwt/create.ts"
import validateJwt from "https://deno.land/x/djwt/validate.ts"

const key = "abc123"

const claims = {
  iss: "joe",
  jti: "123456789abc",
  exp: setExpiration(new Date().getTime() + 1),
}

const headerObject = {
  alg: "HS512",
  crit: ["dummy"],
  dummy: 100,
}

const critHandlers = {
  dummy(value: any) {
    console.log(`dummy works: ${value}`)
    return value * 2
  },
}

const jwt = makeJwt(headerObject, claims, key)
if (!jwt) throw Error("something went wrong")
console.log("New JWT:\n", jwt)

const validatedJwt = await validateJwt(jwt, key, true, critHandlers)
if (!validatedJwt || !validatedJwt.header) throw Error("something went wrong")
console.log("----------\nValid JWT\n", validatedJwt)
