import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import { makeJwt } from "./creatingJws.ts"
import { validateJwt } from "./validatingJws.ts"

const s = serve("0.0.0.0:8000")
;(async function main() {
  for await (const req of s) {
    if (req.method === "GET")
      req.respond({
        status: 200,
        body: encode(makeJwt({ typ: "JWT", alg: "HS512" }, { iss: "joe" }, "abc")),
      })
    else
      validateJwt(decode(await req.body()), "abc")
        ? req.respond({
            status: 200,
            body: encode("Valid JWT\n"),
          })
        : req.respond({ status: 401, body: encode("Invalid JWT\n") })
  }
})()
