import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import { makeJwt } from "../create.ts"
import { validateJwt } from "../validate.ts"

const key = "abc"
const claims = {
  iss: "joe",
  exp: 1300819380,
}
const headerObject = {
  alg: "HS512",
  typ: "JWT",
}
const s = serve("0.0.0.0:8000")
;(async function main() {
  for await (const req of s) {
    if (req.method === "GET") {
      const jwt = makeJwt(headerObject, claims, key)
      req.respond({ body: encode(jwt) })
    } else {
      const requestBody = decode(await req.body())
      validateJwt(requestBody, key, false)
        ? req.respond({ body: encode("Valid JWT\n") })
        : req.respond({ status: 401, body: encode("Invalid JWT\n") })
    }
  }
})()
