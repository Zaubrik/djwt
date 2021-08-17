import { create, getNumericDate, verify } from "../mod.ts";
import { serve } from "./example_deps.ts";

import type { Header, Payload } from "../mod.ts";

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);
const payload: Payload = {
  iss: "joe",
  exp: getNumericDate(60),
};
const header: Header = {
  alg: "HS512",
  typ: "JWT",
};

console.log("server is listening at 0.0.0.0:8000");
for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET") {
    req.respond({ body: (await create(header, payload, key)) + "\n" });
  } else {
    const jwt = new TextDecoder().decode(await Deno.readAll(req.body));
    await verify(jwt, key).then(() => req.respond({ body: "Valid JWT\n" }))
      .catch(() => req.respond({ body: "Invalid JWT\n", status: 401 }));
  }
}
