import { makeJwt, setExpiration } from "../create.ts"
import { validateJwt } from "../validate.ts"

const payload = {
  iss: "joe",
  jti: "123456789abc",
  exp: setExpiration(new Date().getTime() + 1000),
  // exp: setExpiration(new Date().getTime() - 20000), // Invalid JWT: the jwt is expired
}
const header = {
  alg: "HS256" as const,
  crit: ["dummy"],
  dummy: 100,
}
const critHandlers = {
  dummy(value: any) {
    console.log(`dummy works: ${value}`)
    return value * 2
  },
}
const key = "abc123"

try {
  const jwt = makeJwt({ header, payload, key })
  console.log("JWT:", jwt)
  const validatedJwt = await validateJwt(jwt, key, {
    isThrowing: true,
    critHandlers,
  })
  console.log("JWT is valid!\n", validatedJwt)
} catch (err) {
  console.log(err)
}
