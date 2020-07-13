# How it works

## base64

#### convertBase64ToUint8Array(data: string): Uint8Array

Converts a base64 encoded ascii string to a Uint8Array.

#### convertUint8ArrayToBase64(data: Uint8Array): string

Converts a Uint8Array to a base64 encoded ascii string.

#### convertStringToBase64(str: string): string

Takes a ucs-2 string and returns a base64 encoded ascii string.

#### convertBase64ToString(str: string): string

Takes a base64 encoded ascii string and returns a ucs-2 string.

### Example

```typescript
const str = "Hello ☸☹☺☻☼☾☿ World ✓"
const uint8Array = new TextEncoder().encode(str)
uint8Array === convertBase64ToUint8Array(convertUint8ArrayToBase64(uint8Array))
str === convertBase64ToString(convertStringToBase64(str))
```