import { create, verify } from "../mod.ts";
import { serve } from "./example_deps.ts";

import type { Header, Payload } from "../mod.ts";

const key = await window.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-384",
  },
  true,
  ["verify", "sign"],
);

const payload: Payload = {
  sub: "1234567890",
  name: "John Doe",
  admin: true,
  iat: 1516239022,
};
const header: Header = {
  alg: "RS384",
  typ: "JWT",
};

console.log("server is listening at 0.0.0.0:8000");
for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET") {
    req.respond({
      body: (await create(header, payload, key.privateKey)) + "\n",
    });
  } else {
    const jwt = new TextDecoder().decode(await Deno.readAll(req.body));
    await verify(jwt, key.publicKey).then(() =>
      req.respond({ body: "Valid JWT\n" })
    )
      .catch(() => req.respond({ body: "Invalid JWT\n", status: 401 }));
  }
}
