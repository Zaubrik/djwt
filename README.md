# djwt

The absolute minimum to make JSON Web Tokens in deno. Based on
[JWT](https://tools.ietf.org/html/rfc7519) and
[JWS](https://www.rfc-editor.org/rfc/rfc7515.html) specifications.

This library is accessible through the https://deno.land/x/ service.

## Features

To generate JWTs which look in their finalized form like this (with line breaks
for display purposes only)

```
 eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9
 .
 eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ
 .
 dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

... we use the mandatory
[**compact serialization**](https://www.rfc-editor.org/rfc/rfc7515.html#section-3.1)
process where a web token is represented as the concatenation of

`'BASE64URL(UTF8(JWS Protected Header))' || '.' || 'BASE64URL(JWS Payload)' ||'.'|| 'BASE64URL(JWS Signature)'`.

### Cryptographic Algorithm

The following signature and MAC algorithms - which are defined in the JSON Web
Algorithms (JWA) [specification](https://www.rfc-editor.org/rfc/rfc7518.html) -
have been implemented already: **HMAC SHA-256** ("HS256") and **none**
([_Unsecured JWTs_](https://tools.ietf.org/html/rfc7519#section-6)).

### Expiration Time

The optional **exp** claim identifies the expiration time on or after which the
JWT must not be accepted for processing. This library checks if the current
date/time is before the expiration date/time listed in the **exp** claim.

### Critical Header

This library supports the Critical Header Parameter **crit** which is described
in the JWS specification
[here](https://www.rfc-editor.org/rfc/rfc7515.html#section-4.1.11).

Look up
[this example](https://github.com/timonson/djwt/blob/master/examples/example.ts)
to see how the **crit** header parameter works.

## API

The API consists mostly of the two functions `makeJwt` and `validateJwt`,
generating and validating a JWT, respectively.

#### makeJwt({ key: string, header: Jose, payload?: Payload }): string

The function `makeJwt` returns the url-safe encoded JWT.

In [cases](https://www.rfc-editor.org/rfc/rfc7515.html#appendix-F) where you
only need the signing and verification feature of the JWS, you can omit the
**payload**.

#### validateJwt(jwt: string, key: string, { isThrowing, critHandlers }: Opts): Promise<JwtObject | null>

The function `validateJwt` returns a _promise_ which - if the JWT is valid -
resolves to a JWT representation as JavaScript object:
`{ header, payload, signature }`. If the Jwt is invalid, the promise resolves to
`null` or an `Error` is thrown - depending how you set the boolean `isThrowing`
(default is `true`).

#### setExpiration(exp: number | Date): number

Additionally there is the helper function `setExpiration` which simplifies
setting an expiration date.

```javascript
// A specific date:
setExpiration(new Date("2022-07-01"))
// One hour from now:
setExpiration(new Date().getTime() + 60 * 60 * 1000)
```

## Example

Run the following _server_ example with `deno run -A example.ts`:

The server will respond to a **GET** request with a newly created JWT.  
On the other hand, if you send a JWT as data along with a **POST** request, the
server will check the validity of the JWT.

```javascript
import { serve } from "https://deno.land/std/http/server.ts"
import { validateJwt } from "https://deno.land/x/djwt/validate.ts"
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt/create.ts"

const key = "your-secret"
const payload: Payload = {
  iss: "joe",
  exp: setExpiration(new Date().getTime() + 60000),
}
const header: Jose = {
  alg: "HS256",
  typ: "JWT",
}

console.log("server is listening at 0.0.0.0:8000")
for await (const req of serve("0.0.0.0:8000")) {
  if (req.method === "GET") {
    req.respond({ body: makeJwt({ header, payload, key }) + "\n" })
  } else {
    const jwt = new TextDecoder().decode(await Deno.readAll(req.body))
    await validateJwt(jwt, key, { isThrowing: false })
      ? req.respond({ body: "Valid JWT\n" })
      : req.respond({ body: "Invalid JWT\n", status: 401 })
  }
}
```

## Contribution

Every kind of contribution to this project is highly appreciated.
