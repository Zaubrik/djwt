import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import makeJwt, { setExpiration } from "../create.ts"
import validateJwt from "../validate.ts"

const key = "abc123"
const claims = {
  iss: "joe",
  exp: setExpiration(new Date().getTime() + 60000),
}
const header = {
  alg: "HS512",
  typ: "JWT",
}

console.log("server is listening at 0.0.0.0:8000")
for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET") {
    const jwt = makeJwt(header, claims, key)
    req.respond({ body: encode(jwt + "\n") })
  } else {
    const requestBody = decode(await Deno.readAll(req.body))
    ;(await validateJwt(requestBody, key, false))
      ? req.respond({ body: encode("Valid JWT\n") })
      : req.respond({ status: 401, body: encode("Invalid JWT\n") })
  }
}
