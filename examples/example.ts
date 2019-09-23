import makeJwt from "../create.ts"
import { setExpiration } from "../create.ts"
import validateJwt from "../validate.ts"

const claims = {
  iss: "joe",
  exp: setExpiration(new Date().getTime() + 1000),
}

const headerObject = {
  alg: "HS256",
  typ: "JWT",
  // crit: ["dummy"],
}

const handlers = {
  exp(header) {
    return (header.exp = "2019-12-09")
  },
  dummy(header) {
    console.log(header.typ)
  },
}
const key = "abcdef"
try {
  const jwt = makeJwt(headerObject, claims, key)
  const validatedJwt = validateJwt(jwt, key, true, handlers)
  console.log(jwt)
  console.log(validatedJwt)
} catch (err) {
  console.log(err)
}
