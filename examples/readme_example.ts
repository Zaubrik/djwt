import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/encoding/utf8.ts"
import validateJwt from "../validate.ts"
import makeJwt, { setExpiration, Jose, Payload } from "../create.ts"

const key = "your-secret"
const payload: Payload = {
  iss: "joe",
  exp: setExpiration(new Date().getTime() + 60000),
}
const header: Jose = {
  alg: "HS256",
  typ: "JWT",
}

console.log("server is listening at 0.0.0.0:8000")
for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET") {
    const jwt = makeJwt({ header, payload, key })
    req.respond({ body: encode(jwt + "\n") })
  } else {
    const requestBody = decode(await Deno.readAll(req.body))
    ;(await validateJwt(requestBody, key, false))
      ? req.respond({ body: encode("Valid JWT\n") })
      : req.respond({ body: encode("Invalid JWT\n"), status: 401 })
  }
}
