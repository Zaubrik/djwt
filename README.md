# djwt

Create and verify JSON Web Tokens with Deno or the browser.

## API

Please use the native
[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey)
to generate a **secure** `CryptoKey`.

```typescript
const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);
```

### create

Takes `Header`, `Payload` and `CryptoKey` and returns the url-safe encoded
`jwt`.

```typescript
import { create } from "https://deno.land/x/djwt@$VERSION/mod.ts";

const jwt = await create({ alg: "HS512", typ: "JWT" }, { foo: "bar" }, key);
```

### verify

Takes `jwt`, `CryptoKey` and `VerifyOptions` and returns the `Payload` of the
`jwt` if the `jwt` is valid. Otherwise it throws an `Error`.

```typescript
import { verify } from "https://deno.land/x/djwt@$VERSION/mod.ts";

const payload = await verify(jwt, key); // { foo: "bar" }
```

### decode

Takes a `jwt` and returns a 3-tuple
`[header: unknown, payload: unknown, signature: Uint8Array]` if the `jwt` has a
valid _serialization_. Otherwise it throws an `Error`. This function does
**not** verify the digital signature.

```typescript
import { decode } from "https://deno.land/x/djwt@$VERSION/mod.ts";

const [header, payload, signature] = decode(jwt);
```

### getNumericDate

This helper function simplifies setting a
[NumericDate](https://tools.ietf.org/html/rfc7519#page-6). It takes either a
`Date` object or a `number` (in seconds) and returns the number of seconds from
1970-01-01T00:00:00Z UTC until the specified UTC date/time.

```typescript
// A specific date:
const exp = getNumericDate(new Date("2025-07-01"));
// One hour from now:
const nbf = getNumericDate(60 * 60);
```

## Claims

### Expiration Time (exp)

The optional `exp` claim in the payload identifies the expiration time on or
after which the JWT must not be accepted for processing. Its value must be a
number containing a **NumericDate** value. This module checks if the current
date/time is before the expiration date/time listed in the `exp` claim.

```typescript
const jwt = await create(header, { exp: getNumericDate(60 * 60) }, key);
```

### Not Before (nbf)

The optional `nbf` (_not before_) claim identifies the time before which the jwt
must not be accepted for processing. Its value must be a number containing a
**NumericDate** value.

### Audience (aud)

The optional `aud` (_audience_) claim identifies the recipients that the JWT is
intended for. By passing the the option `audience` with the type
`string | string[]` to `verify`, this application tries to identify the
recipient with a value in the `aud` claim when this claim is present. If the
values don't match, an `Error` is thrown.

## Algorithms

The following signature and MAC algorithms have been implemented:

- HS256 (HMAC SHA-256)
- HS384 (HMAC SHA-384)
- HS512 (HMAC SHA-512)
- RS256 (RSASSA-PKCS1-v1_5 SHA-256)
- RS384 (RSASSA-PKCS1-v1_5 SHA-384)
- RS512 (RSASSA-PKCS1-v1_5 SHA-512)
- PS256 (RSASSA-PSS SHA-256)
- PS384 (RSASSA-PSS SHA-384)
- PS512 (RSASSA-PSS SHA-512)
- ES256 (ECDSA using P-256 and SHA-256)
- ES384 (ECDSA using P-384 and SHA-384)
- ES512 (ECDSA using P-521 and SHA-512) (Not supported yet!)
- none ([_Unsecured JWTs_](https://tools.ietf.org/html/rfc7519#section-6)).

## Serialization

This application uses the JWS Compact Serialization only.

## Specifications

- [JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [JSON Web Signature](https://www.rfc-editor.org/rfc/rfc7515.html)
- [JSON Web Algorithms](https://www.rfc-editor.org/rfc/rfc7518.html)

## Applications

The following projects use djwt:

- [AuthCompanion](https://github.com/authcompanion/authcompanion): An
  effortless, token-based user management server - well suited for modern web
  projects.
- [Oak Middleware JWT](https://github.com/halvardssm/oak-middleware-jwt)

## Contribution

We welcome and appreciate all contributions to djwt.

A big **Thank You** to [timreichen](https://github.com/timreichen) and all the
other amazing contributors.
