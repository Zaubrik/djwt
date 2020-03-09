# base64url

base64url conversion from/to base64 - no dependencies - es module

## How it works

#### convertBase64ToBase64url(base64: string): string

The `+` and `/` characters of standard **base64** are respectively replaced by
`-` and `_` and the padding `=` characters are removed.

#### convertBase64urlToBase64(base64url: string): string

Converts a **base64url** string to standard **base64**.

#### addPaddingToBase64url(base64url: string): string

The `addPaddingToBase64url` function makes the string length a _multiple of 4_
by adding the padding `=` character.  
More about this [here](https://en.wikipedia.org/wiki/Base64#URL_applications).

## Example

```typescript
const base64 = "c3ViamVjdHM/X2Q9MQ=="
const base64url = convertBase64ToBase64url(base64)

console.log(base64url) // c3ViamVjdHM_X2Q9MQ
```
