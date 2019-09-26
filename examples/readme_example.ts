import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import makeJwt, {
  setExpiration,
} from "https://denopkg.com/timonson/djwt/create.ts"
import validateJwt from "https://denopkg.com/timonson/djwt/validate.ts"
// import makeJwt, { setExpiration } from "../create.ts"
// import validateJwt from "../validate.ts"

const key = "abc"
const claims = {
  iss: "joe",
  exp: setExpiration(new Date().getTime() + 60_000),
}
const headerObject = {
  alg: "HS512",
  typ: "JWT",
}
;(async () => {
  for await (const req of serve("0.0.0.0:8000")) {
    if (req.method === "GET") {
      const jwt = makeJwt(headerObject, claims, key)
      req.respond({ body: encode(jwt + "\n") })
    } else {
      const requestBody = decode(await req.body())
      validateJwt(requestBody, key, false)
        ? req.respond({ body: encode("Valid JWT\n") })
        : req.respond({ status: 401, body: encode("Invalid JWT\n") })
    }
  }
})()
