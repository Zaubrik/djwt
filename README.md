# djwt

the absolute minimum to make JSON Web Tokens on deno. Based on JWT and JWS
specifications.

## API

#### makeJwt(headerObject: Jose, claims: Claims, key: string)

#### validateJwt(jwt: string, key: string, throwErrors: boolean = true, criticalHandlers: CritHandlers = {})

## Example

```javascript
import { serve } from "https://deno.land/std/http/server.ts"
import { encode, decode } from "https://deno.land/std/strings/mod.ts"
import { makeJwt } from "https://denopkg.com/timonson/djwt/create.ts"
import { validateJwt } from "https://denopkg.com/timonson/djwt/validate.ts"

const claims = {
  iss: "joe",
  exp: 1300819380,
}
const headerObject = {
  alg: "HS512",
  typ: "JWT",
}
const key = "abc"
const s = serve("0.0.0.0:8000")

;(async function main() {
  for await (const req of s) {
    if (req.method === "GET") {
      const jwt = makeJwt(headerObject, claims, key)
      req.respond({ body: encode(jwt) })
    } else {
      const requestBody = decode(await req.body())
      validateJwt(requestBody, key, false)
        ? req.respond({ body: encode("Valid JWT\n") })
        : req.respond({ status: 401, body: encode("Invalid JWT\n") })
    }
  }
})()
```

## Todo

1. Add more optional features from the [JWT](https://tools.ietf.org/html/rfc7519) and
   [JWS](https://www.rfc-editor.org/rfc/rfc7515.html) specifications
2. Improve documentation
3. Make more tests
