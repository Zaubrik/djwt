import { create, verify } from "../mod.ts";
import { dirname, fromFileUrl, serve } from "./example_deps.ts";

import type { Header, Payload } from "../mod.ts";

const moduleDir = dirname(fromFileUrl(import.meta.url));
const publicKey = await Deno.readTextFile(moduleDir + "/certs/public.pem");
const privateKey = await Deno.readTextFile(moduleDir + "/certs/private.pem");
const payload: Payload = {
  sub: "1234567890",
  name: "John Doe",
  admin: true,
  iat: 1516239022,
};
const header: Header = {
  alg: "RS256",
  typ: "JWT",
};

console.log("server is listening at 0.0.0.0:8000");
for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET") {
    req.respond({ body: (await create(header, payload, privateKey)) + "\n" });
  } else {
    const jwt = new TextDecoder().decode(await Deno.readAll(req.body));
    await verify(jwt, publicKey, "RS256").then(() =>
      req.respond({ body: "Valid JWT\n" })
    ).catch(() => req.respond({ body: "Invalid JWT\n", status: 401 }));
  }
}
