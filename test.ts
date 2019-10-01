import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import makeJwt, { setExpiration } from "https://deno.land/x/djwt/create.ts"
import validateJwt from "https://deno.land/x/djwt/validate.ts"

const key = "abc123"
const claims = {
  iss: "joe",
  exp: setExpiration(new Date().getTime() + 60_000),
}
const headerObject = {
  alg: "HS512",
  typ: "JWT",
}

try {
  const jwt = makeJwt(headerObject, claims, key)
  console.log("New JWT:\n", jwt)
  validateJwt(jwt, key)
  console.log("----------\nValid JWT")
} catch (err) {
  console.log(err.message, err)
}
