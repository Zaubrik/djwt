import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import {
  convertBase64ToBase64url,
  convertBase64urlToBase64,
  addPaddingToBase64url,
} from "../base64url.ts"

const oneBase64 = "c3ViamVjdHM/X2Q9MQ=="
const oneBase64url = "c3ViamVjdHM_X2Q9MQ"
const twoBase64 = "SGVsbG8gV29ybGQ="
const twoBase64url = "SGVsbG8gV29ybGQ"

Deno.test(function convertBase64ToBase64urlTest(): void {
  assertEquals(convertBase64ToBase64url(oneBase64), oneBase64url)
  assertEquals(convertBase64ToBase64url(twoBase64), twoBase64url)
})

Deno.test(function convertBase64urlToBase64Test(): void {
  assertEquals(convertBase64urlToBase64(oneBase64url), oneBase64)
  assertEquals(convertBase64urlToBase64(twoBase64url), twoBase64)
})
