import { create, getNumericDate, verify } from "../mod.ts";
import { serve } from "./example_deps.ts";

import type { Header, Payload } from "../mod.ts";

const key = "your-secret";
const payload: Payload = {
  iss: "joe",
  exp: getNumericDate(60),
};
const header: Header = {
  alg: "HS256",
  typ: "JWT",
};

console.log("server is listening at 0.0.0.0:8000");
for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET") {
    req.respond({ body: (await create(header, payload, key)) + "\n" });
  } else {
    const jwt = new TextDecoder().decode(await Deno.readAll(req.body));
    await verify(jwt, key, "HS256").then(() =>
      req.respond({ body: "Valid JWT\n" })
    ).catch(() => req.respond({ body: "Invalid JWT\n", status: 401 }));
  }
}
