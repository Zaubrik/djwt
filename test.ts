import makeJwt, { setExpiration } from "https://deno.land/x/djwt/create.ts"
import validateJwt from "https://deno.land/x/djwt/validate.ts"

const key1 = "4%5 67_8$9"
const claims1 = {
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
    console.log(`dummy works: ${value}`)
    return value * 2
  },
}

const jwt1 = makeJwt(headerObject1, claims1, key1)
if (!jwt1) throw Error("something went wrong")
console.log("New JWT:\n", jwt1)

const validatedJwt1 = await validateJwt(jwt1, key1, true, critHandlers1)
if (typeof validatedJwt1 !== "object") throw Error("something went wrong")
console.log("Valid JWT\n", validatedJwt1)

//

const claims2 = ""
const headerObject2 = { typ: "JWT", alg: "none" }

const jwt2 = makeJwt(headerObject2, claims2)
if (!jwt2) throw Error("something went wrong")
console.log("New JWT:\n", jwt2)

const validatedJwt2 = await validateJwt(jwt2)
if (typeof validatedJwt2 !== "object") throw Error("something went wrong")
console.log("Valid JWT\n", validatedJwt2)
