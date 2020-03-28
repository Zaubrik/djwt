import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import makeJwt from "../create.ts"
import validateJwt from "../validate.ts"

const jwtInput = {
  header: { typ: "JWT", alg: "HS256" as const },
  payload: { iss: "joe" },
}

for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET")
    req.respond({
      body: encode(makeJwt(jwtInput, "abc123") + "\n"),
    })
  else
    (await validateJwt(decode(await Deno.readAll(req.body)), "abc123", false))
      ? req.respond({ body: encode("Valid JWT\n") })
      : req.respond({ status: 401, body: encode("Invalid JWT\n") })
}
