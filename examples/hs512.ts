import {
  create,
  getNumericDate,
  type Header,
  type Payload,
  verify,
} from "../mod.ts";

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

async function handleRequest(request: Request) {
  if (request.method === "GET") {
    return new Response(await create(header, payload, key) + "\n");
  } else {
    try {
      const jwt = await request.text();
      const payload = await verify(jwt, key);
      return Response.json(payload);
    } catch {
      return new Response("Invalid JWT\n", { status: 401 });
    }
  }
}

Deno.serve(handleRequest);
