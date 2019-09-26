# djwt

the absolute minimum to make JSON Web Tokens on deno. Based on
[JWT](https://tools.ietf.org/html/rfc7519) and
[JWS](https://www.rfc-editor.org/rfc/rfc7515.html) specifications.

## Features

This library uses the **JWS Compact Serialization** where a web token is
represented as the concatenation of:

`'BASE64URL(UTF8(JWS Protected Header))' || '.' || 'BASE64URL(JWS Payload)' ||'.' || 'BASE64URL(JWS Signature)'`

... what looks in reality like this:

```
		 eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9
     .
     eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ
     .
     dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

#### "crit" (Critical) Header Parameter

It supports the **Critical Header Parameter** like described in the
[JWS specification](https://www.rfc-editor.org/rfc/rfc7515.html#section-4.1.11).

For an example which includes this header parameter look into the
[examples folder](https://github.com/timonson/djwt/tree/master/examples).

## API

The API consists mostly of the two functions `makeJwt` and `validateJwt`.

You can omit the JWT payload and its claims if you only need the signing and
verification feature of the JWS.

#### makeJwt(headerObject: Jose, claims: Claims | string = "", key: string)

#### validateJwt(jwt: string, key: string, throwErrors: boolean = true, criticalHandlers: CritHandlers = {})

Additionally there is the helper function `setExpiration` which simplifies
setting an expiration date.

#### setExpiration(exp: number | Date): number

```javascript
// A specific date:
setExpiration(new Date("2020-07-01"))
// One hour from now:
setExpiration(new Date().getTime() + 60 * 60 * 1000)
```

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

1. Add more optional features from the
   [JWT](https://tools.ietf.org/html/rfc7519) and
   [JWS](https://www.rfc-editor.org/rfc/rfc7515.html) specifications
2. Improve documentation
3. Make more tests
