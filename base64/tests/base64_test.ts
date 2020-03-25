import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import {
  convertBase64ToUint8Array,
  convertUint8ArrayToBase64,
  convertStringToBase64,
  convertBase64ToString,
} from "../base64.ts"

const str = "Hello ☸☹☺☻☼☾☿ World ✓"
const uint8Array = new TextEncoder().encode(str)

Deno.test(function convertBase64ToUint8ArrayAndBackTest(): void {
  assertEquals(
    uint8Array,
    convertBase64ToUint8Array(convertUint8ArrayToBase64(uint8Array))
  )
})

Deno.test(function convertBase64ToStringAndBackTest(): void {
  assertEquals(str, convertBase64ToString(convertStringToBase64(str)))
})
