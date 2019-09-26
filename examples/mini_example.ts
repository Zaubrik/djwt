import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import makeJwt from "https://cdn.jsdelivr.net/gh/timonson/djwt/master@v0.2.0/create.ts"
import validateJwt from "https://cdn.jsdelivr.net/gh/timonson/djwt/master@v0.2.0/validate.ts"
// import makeJwt from "../create.ts"
// import validateJwt from "../validate.ts"
;(async () => {
  for await (const req of serve("0.0.0.0:8000")) {
    if (req.method === "GET")
      req.respond({
        body: encode(
          makeJwt({ typ: "JWT", alg: "HS512" }, { iss: "joe" }, "abc") + "\n"
        ),
      })
    else
      validateJwt(decode(await req.body()), "abc", false)
        ? req.respond({ body: encode("Valid JWT\n") })
        : req.respond({ status: 401, body: encode("Invalid JWT\n") })
  }
})()
