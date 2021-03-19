# djwt

Create and verify JSON Web Tokens with deno.

## API

### create

Takes a `header`, `payload` and `key` and returns the url-safe encoded `jwt`.

```typescript
import { create } from "https://deno.land/x/djwt@$VERSION/mod.ts"

const jwt = await create({ alg: "HS512", typ: "JWT" }, { foo: "bar" }, "secret")
// eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.WePl7achkd0oGNB8XRF_LJwxlyiPZqpdNgdKpDboAjSTsWq-aOGNynTp8TOv8KjonFym8vwFwppXOLoLXbkIaQ
```

### verify

Takes a `jwt`, `key` and an `algorithm` and returns the `payload` of the `jwt`
if the `jwt` is valid. Otherwise it throws an `Error`.

```typescript
import { verify } from "https://deno.land/x/djwt@$VERSION/mod.ts"

const payload = await verify(jwt, "secret", "HS512") // { foo: "bar" }
```

### decode

Takes a `jwt` and returns a 3-tuple `[header, payload, signature]` if the `jwt`
has a valid _serialization_. Otherwise it throws an `Error`.

```typescript
import { decode } from "https://deno.land/x/djwt@$VERSION/mod.ts"

const jwt =
  "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.WePl7achkd0oGNB8XRF_LJwxlyiPZqpdNgdKpDboAjSTsWq-aOGNynTp8TOv8KjonFym8vwFwppXOLoLXbkIaQ"

const [header, payload, signature] = decode(jwt)
// [
// { alg: "HS512", typ: "JWT" },
// { foo: "bar" },
// "59e3e5eda72191dd2818d07c5d117f2c9c3197288f66aa5d36074aa436e8023493b16abe68e18dca74e9f133aff0a8e89c5c..."
// ]
```

### getNumericDate

This helper function simplifies setting a
[NumericDate](https://tools.ietf.org/html/rfc7519#page-6). It takes either a
`Date` object or a `number` (in seconds) and returns the number of seconds from
1970-01-01T00:00:00Z UTC until the specified UTC date/time.

```typescript
// A specific date:
getNumericDate(new Date("2025-07-01"))
// One hour from now:
getNumericDate(60 * 60)
```

## Claims

### Expiration Time (exp)

The optional **exp** claim in the payload identifies the expiration time on or
after which the JWT must not be accepted for processing. Its value must be a
number containing a **NumericDate** value. This module checks if the current
date/time is before the expiration date/time listed in the **exp** claim.

```typescript
const jwt = await create(header, { exp: getNumericDate(60 * 60) }, "secret")
```

### Not Before (nbf)

The optional **nbf** (_not before_) claim identifies the time before which the
jwt must not be accepted for processing. Its value must be a number containing a
**NumericDate** value.

## Algorithms

The following signature and MAC algorithms have been implemented:

- HS256 (HMAC SHA-256)
- HS512 (HMAC SHA-512)
- RS256 (RSASSA-PKCS1-v1_5 SHA-256)
- RS512 (RSASSA-PKCS1-v1_5 SHA-512)
- PS256 (RSASSA-PSS SHA-256)
- PS512 (RSASSA-PSS SHA-512)
- none ([_Unsecured JWTs_](https://tools.ietf.org/html/rfc7519#section-6)).

## Serialization

This application uses the JWS Compact Serialization only.

## Specifications

- [JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [JSON Web Signature](https://www.rfc-editor.org/rfc/rfc7515.html)
- [JSON Web Algorithms](https://www.rfc-editor.org/rfc/rfc7518.html)

## Contribution

Every kind of contribution to this project is highly appreciated. Please run
`deno fmt` on the changed files before making a pull request.

Big **Thank you** to [timreichen](https://github.com/timreichen) and all the
other amazing contributors.
