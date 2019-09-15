import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import { makeJwt, validateJwt } from "https://denopkg.com/timonson/djwt/mod.ts"

const s = serve("0.0.0.0:8000")
;(async function main() {
  for await (const req of s) {
    if (req.method === "GET")
      req.respond({
        body: encode(makeJwt({ typ: "JWT", alg: "HS512" }, { iss: "joe" }, "abc")),
      })
    else
      validateJwt(decode(await req.body()), "abc", false)
        ? req.respond({ body: encode("Valid JWT\n") })
        : req.respond({ status: 401, body: encode("Invalid JWT\n") })
  }
})()
