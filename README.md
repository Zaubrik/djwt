# djwt

Create and verify JSON Web Tokens.

## JSON Web Token

### create

Takes a `payload`, `header` and `key` and returns the url-safe encoded `jwt`.

```typescript
import { create } from "https://deno.land/x@$VERSION/djwt/mod.ts"

const token = await create({ alg: "HS512", typ: "JWT" }, { foo: "bar" }, key)
// eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.WePl7achkd0oGNB8XRF_LJwxlyiPZqpdNgdKpDboAjSTsWq-aOGNynTp8TOv8KjonFym8vwFwppXOLoLXbkIaQ
```

### verify

Takes a `token`, `key` and an `algorithm` and returns the `payload` of the
`token` if the `token` is valid. Otherwise it throws an `Error`.

```typescript
import { verify } from "https://deno.land/x@$VERSION/djwt/mod.ts"

const payload = await verify(token, key, "HS512") // { foo: "bar" }
```

### decode

Takes a `token` to return an object with the `header`, `payload` and `signature`
properties if the `token` is valid. Otherwise it throws an `Error`.

```typescript
import { decode } from "https://deno.land/x@$VERSION/djwt/mod.ts"

const token =
  "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.WePl7achkd0oGNB8XRF_LJwxlyiPZqpdNgdKpDboAjSTsWq-aOGNynTp8TOv8KjonFym8vwFwppXOLoLXbkIaQ"

const { payload, signature, header } = await decode(token) // { header: { alg: "HS512", typ: "JWT" }, payload: { foo: "bar" }, signature: "59e3e5eda72191dd2818d07c5d117f2c9c3197288f66aa5d36074aa436e8023493b16abe68e18dca74e9f133aff0a8e89c5ca6f2fc05c29a5738ba0b5db90869" }
```

## Claims

### Expiration Time (exp)

The optional **exp** claim in the payload (number of seconds since January 1,
1970, 00:00:00 UTC) that identifies the expiration time on or after which the
JWT must not be accepted for processing. This module checks if the current
date/time is before the expiration date/time listed in the **exp** claim.

```typescript
const oneHour = 60 * 60
const token = await create({ exp: Date.now() / 1000 + oneHour }, "secret")
```

#### getNumericDate

We export the helper function `getNumericDate` which simplifies setting an
expiration date. It takes either an Date object or a number (in seconds) as
argument.

```typescript
// A specific date:
getNumericDate(new Date("2025-07-01"))
// One hour from now:
getNumericDate(60 * 60)
```

### Not Before (nbf)

The **nbf** (not before) claim identifies the time before which the jwt must not
be accepted for processing. Its value must be a number containing a
`NumericDate` value like the `exp` claim does.

## Algorithms

The following signature and MAC algorithms have been implemented:

- HS256 (HMAC SHA-256)
- HS512 (HMAC SHA-512)
- RS256 (RSASSA-PKCS1-v1_5 SHA-256)
- none ([_Unsecured JWTs_](https://tools.ietf.org/html/rfc7519#section-6)).

## Serialization

This application uses the JWS Compact Serialization only.

## Specifications

- [JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [JSON Web Signature](https://www.rfc-editor.org/rfc/rfc7515.html)
- [JSON Web Algorithms](https://www.rfc-editor.org/rfc/rfc7518.html)
