import {
  create,
  decode,
  getNumericDate,
  type Header,
  type Payload,
  validate,
  verify,
} from "../mod.ts";
import { isDefined, isNull, isString } from "../util.ts";
import {
  assertEquals,
  assertRejects,
  assertThrows,
  decodeHex,
} from "./test_deps.ts";

const header: Header = {
  alg: "HS256",
  typ: "JWT",
};

const payload: Payload = {
  name: "John Doe",
};

const keyHS256 = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode("secret"),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"],
);

const keyHS384 = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-384" },
  true,
  ["sign", "verify"],
);

const keyHS512 = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode("secret"),
  { name: "HMAC", hash: "SHA-512" },
  false,
  ["sign", "verify"],
);

const keyRS256 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["verify", "sign"],
);
const keyRS384 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-384",
  },
  true,
  ["verify", "sign"],
);
const keyRS512 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-512",
  },
  true,
  ["verify", "sign"],
);

const keyPS256 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSA-PSS",
    // Consider using a 4096-bit key for systems that require long-term security
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["sign", "verify"],
);

const keyPS384 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSA-PSS",
    // Consider using a 4096-bit key for systems that require long-term security
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-384",
  },
  true,
  ["sign", "verify"],
);

const keyPS512 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSA-PSS",
    // Consider using a 4096-bit key for systems that require long-term security
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-512",
  },
  true,
  ["sign", "verify"],
);

const keyES256 = await globalThis.crypto.subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-256",
  },
  true,
  ["sign", "verify"],
);

const keyES384 = await globalThis.crypto.subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-384",
  },
  true,
  ["sign", "verify"],
);

// P-521 is not yet supported.
// const keyES512 = await globalThis.crypto.subtle.generateKey(
// {
// name: "ECDSA",
// namedCurve: "P-521",
// },
// true,
// ["sign", "verify"],
// );

Deno.test({
  name: "[jwt] create",
  fn: async function () {
    assertEquals(
      await create(
        header,
        payload,
        keyHS256,
      ),
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds",
    );
    assertEquals(
      await create(
        {
          alg: "HS512",
          typ: "JWT",
        },
        {},
        keyHS512,
      ),
      "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.e30.dGumW8J3t2BlAwqqoisyWDC6ov2hRtjTAFHzd-Tlr4DUScaHG4OYqTHXLHEzd3hU5wy5xs87vRov6QzZnj410g",
    );
    assertEquals(
      await create({ alg: "HS512", typ: "JWT" }, { foo: "bar" }, keyHS512),
      "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.WePl7achkd0oGNB8XRF_LJwxlyiPZqpdNgdKpDboAjSTsWq-aOGNynTp8TOv8KjonFym8vwFwppXOLoLXbkIaQ",
    );
    await assertRejects(
      async () => {
        await create(header, payload, keyHS512);
      },
      Error,
      "The jwt's alg 'HS256' does not match the key's algorithm.",
    );
    await assertRejects(
      async () => {
        await create(header, "invalid payload" as unknown as Payload, keyHS512);
      },
      Error,
      "The jwt claims set is not a JSON object.",
    );
  },
});

Deno.test({
  name: "[jwt] verify",
  fn: async function () {
    assertEquals(
      await verify(
        await create(header, payload, keyHS256),
        keyHS256,
      ),
      payload,
    );
    await assertEquals(
      await verify(
        await create({ alg: "HS512", typ: "JWT" }, {}, keyHS512),
        keyHS512,
      ),
      {},
    );

    await assertEquals(
      await verify(
        await create({ alg: "HS512", typ: "JWT" }, {}, keyHS512),
        keyHS512,
        { expLeeway: 10 },
      ),
      {},
    );

    await assertEquals(
      await verify(
        await create({ alg: "HS512", typ: "JWT" }, {}, keyHS512),
        keyHS512,
        { nbfLeeway: 10 },
      ),
      {},
    );

    await assertEquals(
      await verify(
        await create({ alg: "HS512", typ: "JWT" }, { exp: 0 }, keyHS512),
        keyHS512,
        { ignoreExp: true },
      ),
      { exp: 0 },
    );

    await assertEquals(
      (await verify<{ email: string }>(
        await create(
          { alg: "HS512", typ: "JWT" },
          { email: "joe@example.com" },
          keyHS512,
        ),
        keyHS512,
        { ignoreExp: true },
      )).email,
      "joe@example.com",
    );

    await assertEquals(
      await verify(
        await create(
          { alg: "HS512", typ: "JWT" },
          { nbf: 1111111111111111111111111111 },
          keyHS512,
        ),
        keyHS512,
        { ignoreNbf: true },
      ),
      { nbf: 1111111111111111111111111111 },
    );

    await assertRejects(
      async () => {
        await verify(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsd",
          keyHS256,
        );
      },
      Error,
      "The jwt's signature does not match the verification signature.",
    );

    await assertRejects(
      async () => {
        // payload = { "exp": false }
        await verify(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOmZhbHNlfQ.LXb8M9J6ar14CTq7shnqDMWmSsoH_zyIHiD44Rqd6uI",
          keyHS512,
        );
      },
      Error,
      "The jwt has an invalid 'exp' or 'nbf' claim.",
    );

    await assertRejects(
      async () => {
        await verify("", keyHS512);
      },
      Error,
      "The serialization of the jwt is invalid.",
    );

    await assertRejects(
      async () => {
        await verify("invalid", keyHS512);
      },
      Error,
      "The serialization of the jwt is invalid.",
    );

    await assertRejects(
      async () => {
        await verify(
          await create(header, {
            // @ts-ignore */
            nbf: "invalid",
            exp: 100000000000000000000,
          }, keyHS256),
          keyHS256,
        );
      },
      Error,
      "The jwt has an invalid 'exp' or 'nbf' claim",
    );

    await assertRejects(
      async () => {
        await verify(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..F6X5eXaBMszYO1kMrujBGGw4-FTJp2Uld6Daz9v3cu4",
          keyHS256,
        );
      },
      Error,
      "The serialization of the jwt is invalid.",
    );
    await assertRejects(
      async () => {
        await verify(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YWJj.uE63kRv-19VnJUBL4OUKaxULtqZ27cJwl8V9IXjJaHg",
          keyHS256,
        );
      },
      Error,
      "The serialization of the jwt is invalid.",
    );

    await assertRejects(
      async () => {
        await verify(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.bnVsbA.tv7DbhvALc5Eq2sC61Y9IZlG2G15hvJoug9UO6iwmE_UZOLva8EC-9PURg7IIj6f-F9jFWix8vCn9WaAMHR1AA",
          keyHS512,
        );
      },
      Error,
      "The jwt claims set is not a JSON object",
    );

    await assertRejects(
      async () => {
        await verify(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.dHJ1ZQ.Wmj2Jb9m6FQaZ0rd4AHNR2u9THED_m-aPfGx1w5mtKalrx7NWFS98ZblUNm_Szeugg9CUzhzBfPDyPUA2LTTkA",
          keyHS512,
        );
      },
      Error,
      "The jwt claims set is not a JSON object",
    );
    await assertRejects(
      async () => {
        await verify(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.W10.BqmZ-tVI9a-HDx6PpMiBdMq6lzcaqO9sW6pImw-NRajCCmRrVi6IgMhEw7lvOG6sxhteceVMl8_xFRGverJJWw",
          keyHS512,
        );
      },
      Error,
      "The jwt claims set is not a JSON object",
    );
    await assertRejects(
      async () => {
        await verify(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.WyJhIiwxLHRydWVd.eVsshnlupuoVv9S5Q7VOj2BkLyZmOSC27fCoXwyq_MG8B95P2GkLDkL8Fo0Su7qoh1G0BxYjVRHgVppTgpuZRw",
          keyHS512,
        );
      },
      Error,
      "The jwt claims set is not a JSON object",
    );
  },
});

Deno.test({
  name: "[jwt] decode",
  fn: async function () {
    assertEquals(
      decode(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.TVCeFl1nnZWUMQkAQKuSo_I97YeIZAS8T1gOkErT7F8",
      ),
      [
        { alg: "HS256", typ: "JWT" },
        {},

        decodeHex(
          "4d509e165d679d959431090040ab92a3f23ded87886404bc4f580e904ad3ec5f",
        ),
      ],
    );
    assertThrows(
      () => {
        decode("aaa");
      },
      Error,
      "The serialization of the jwt is invalid.",
    );

    assertThrows(
      () => {
        decode("a");
      },
      Error,
      "The serialization of the jwt is invalid.",
    );

    assertThrows(
      () => {
        // "ImEi" === base64url("a")
        decode("ImEi.ImEi.ImEi.ImEi");
      },
      Error,
      "The serialization of the jwt is invalid.",
    );

    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const header: Header = {
      alg: "HS256",
      typ: "JWT",
    };
    const payload = {
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    };
    assertEquals(decode(jwt), [
      header,
      payload,
      decodeHex(
        "49f94ac7044948c78a285d904f87f0a4c7897f7e8f3a4eb2255fda750b2cc397",
      ),
    ]);
    assertEquals(
      await create(
        header,
        payload,
        await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode("your-256-bit-secret"),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign", "verify"],
        ),
      ),
      jwt,
    );
  },
});

Deno.test({
  name: "[jwt] validate",
  fn: async function () {
    assertEquals(
      validate(
        [
          { alg: "HS256", typ: "JWT" },
          { exp: 1111111111111111111111111111 },
          new Uint8Array(),
        ],
      ),
      {
        header: { alg: "HS256", typ: "JWT" },
        payload: { exp: 1111111111111111111111111111 },
        signature: new Uint8Array(),
      },
    );
    assertThrows(
      () => {
        validate([, , new Uint8Array()]);
      },
      Error,
      "The jwt's 'alg' header parameter value must be a string.",
    );

    assertThrows(
      () => {
        validate([null, {}, new Uint8Array()]);
      },
      Error,
      "The jwt's 'alg' header parameter value must be a string.",
    );

    assertThrows(
      () => {
        validate([{ alg: "HS256", typ: "JWT" }, [], new Uint8Array()]);
      },
      Error,
      "The jwt claims set is not a JSON object.",
    );

    assertThrows(
      () => {
        validate([{ alg: "HS256" }, { exp: "" }, new Uint8Array()]);
      },
      Error,
      "The jwt has an invalid 'exp' or 'nbf' claim.",
    );

    assertThrows(
      () => {
        validate([{ alg: "HS256" }, { exp: 1 }, new Uint8Array()]);
      },
      Error,
      "The jwt is expired.",
    );

    assertThrows(
      () => {
        validate([
          { alg: "HS256" },
          { nbf: 1111111111111111111111111111 },
          new Uint8Array(),
        ]);
      },
      Error,
      "The jwt is used too early.",
    );

    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const header: Header = {
      alg: "HS256",
      typ: "JWT",
    };
    const payload = {
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    };
    assertEquals(decode(jwt), [
      header,
      payload,
      decodeHex(
        "49f94ac7044948c78a285d904f87f0a4c7897f7e8f3a4eb2255fda750b2cc397",
      ),
    ]);
    assertEquals(
      await create(
        header,
        payload,
        await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode("your-256-bit-secret"),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign", "verify"],
        ),
      ),
      jwt,
    );
  },
});

Deno.test({
  name: "[jwt] expired jwt",
  fn: async function () {
    const payload = {
      iss: "joe",
      jti: "123456789abc",
      exp: 20000,
    };
    const header: Header = {
      alg: "HS256",
      dummy: 100,
    };

    await assertRejects(
      async () => {
        await verify(
          await create(
            header,
            { exp: 0 },
            keyHS256,
          ),
          keyHS256,
        );
      },
      Error,
      "The jwt is expired.",
    );

    await assertRejects(
      async () => {
        await verify(
          await create(header, payload, keyHS256),
          keyHS256,
        );
      },
      Error,
      "The jwt is expired.",
    );
  },
});

Deno.test({
  name: "[jwt] too early jwt",
  fn: async function () {
    const payload = {
      iss: "joe",
      jti: "123456789abc",
    };
    const header: Header = {
      alg: "HS256",
    };
    const lateNbf = Date.now() / 1000 - 5;
    const earlyNbf = Date.now() / 1000 + 5;
    assertEquals(
      await verify(
        await create(header, { ...payload, nbf: lateNbf }, keyHS256),
        keyHS256,
      ),
      { ...payload, nbf: lateNbf },
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload, nbf: earlyNbf }, keyHS256),
          keyHS256,
        );
      },
      Error,
      "The jwt is used too early.",
    );
  },
});

Deno.test({
  name: "[jwt] aud claim",
  fn: async function () {
    const payload = {
      iss: "joe",
    };
    const audValue = "smtp";
    const header: Header = {
      alg: "HS256",
    };
    assertEquals(
      await verify(
        await create(header, { ...payload, aud: audValue }, keyHS256),
        keyHS256,
      ),
      { ...payload, aud: audValue },
    );
    assertEquals(
      await verify(
        await create(header, { ...payload, aud: [] }, keyHS256),
        keyHS256,
      ),
      { ...payload, aud: [] },
    );
    assertEquals(
      await verify(
        await create(header, { ...payload, aud: [audValue, "sol"] }, keyHS256),
        keyHS256,
        { audience: audValue },
      ),
      { ...payload, aud: [audValue, "sol"] },
    );
    assertEquals(
      await verify(
        await create(header, { ...payload, aud: [audValue, "sol"] }, keyHS256),
        keyHS256,
        { audience: ["wrong", audValue] },
      ),
      { ...payload, aud: [audValue, "sol"] },
    );
    assertEquals(
      await verify(
        await create(header, { ...payload, aud: audValue }, keyHS256),
        keyHS256,
        { audience: audValue },
      ),
      { ...payload, aud: audValue },
    );
    assertEquals(
      await verify(
        await create(header, { ...payload, aud: audValue }, keyHS256),
        keyHS256,
        { audience: [audValue, "sol"] },
      ),
      { ...payload, aud: audValue },
    );
    assertEquals(
      await verify(
        await create(header, { ...payload, aud: [audValue, "sol"] }, keyHS256),
        keyHS256,
        { audience: new RegExp("^s.*") },
      ),
      { ...payload, aud: [audValue, "sol"] },
    );
    assertEquals(
      await verify(
        await create(header, { ...payload, aud: audValue }, keyHS256),
        keyHS256,
        { audience: new RegExp("^s.*") },
      ),
      { ...payload, aud: audValue },
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload }, keyHS256),
          keyHS256,
          { audience: audValue },
        );
      },
      Error,
      "The jwt has no 'aud' claim.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(
            header,
            { ...payload, aud: 10 as unknown as string },
            keyHS256,
          ),
          keyHS256,
          { audience: audValue },
        );
      },
      Error,
      "The jwt has an invalid 'aud' claim.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(
            header,
            { ...payload, aud: [undefined] as unknown as string[] },
            keyHS256,
          ),
          keyHS256,
          { audience: audValue },
        );
      },
      Error,
      "The jwt has an invalid 'aud' claim.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload, aud: audValue }, keyHS256),
          keyHS256,
          { audience: new RegExp("^a.*") },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(
            header,
            { ...payload, aud: [audValue, "sol"] },
            keyHS256,
          ),
          keyHS256,
          { audience: new RegExp("^a.*") },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload, aud: audValue }, keyHS256),
          keyHS256,
          { audience: audValue + "a" },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(
            header,
            { ...payload, aud: audValue },
            keyHS256,
          ),
          keyHS256,
          { audience: [] },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload, aud: [] }, keyHS256),
          keyHS256,
          { audience: audValue },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload, aud: [] }, keyHS256),
          keyHS256,
          { audience: new RegExp(".*") },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload, aud: audValue }, keyHS256),
          keyHS256,
          { audience: "wrong" },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload, aud: audValue }, keyHS256),
          keyHS256,
          { audience: [] },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
    await assertRejects(
      async () => {
        await verify(
          await create(header, { ...payload, aud: audValue }, keyHS256),
          keyHS256,
          { audience: ["wrong", "wrong2"] },
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed.",
    );
  },
});

Deno.test({
  name: "[jwt] none algorithm",
  fn: async function () {
    const payload = {
      iss: "joe",
      "http://example.com/is_root": true,
    };
    const header: Header = {
      alg: "none",
    };
    const jwt = await create(header, payload, null);
    assertEquals(
      jwt,
      "eyJhbGciOiJub25lIn0.eyJpc3MiOiJqb2UiLCJodHRwOi8vZXhhbXBsZS5jb20vaXNfcm9vdCI6dHJ1ZX0.",
    );
    const validatedPayload = await verify(
      jwt,
      null,
    );
    assertEquals(validatedPayload, payload);
    await assertRejects(
      async () => {
        await create(header, payload, keyHS256);
      },
      Error,
      "The alg 'none' does not allow a key.",
    );
    await assertRejects(
      async () => {
        await create({ alg: "HS256" }, payload, null);
      },
      Error,
      "The alg 'HS256' demands a key.",
    );
    await assertRejects(
      async () => {
        await verify(await create(header, payload, null), keyHS256);
      },
      Error,
      "The alg 'none' does not allow a key.",
    );
    await assertRejects(
      async () => {
        await verify(await create({ alg: "HS256" }, payload, keyHS256), null);
      },
      Error,
      "The alg 'HS256' demands a key.",
    );
  },
});

Deno.test({
  name: "[jwt] HS256 algorithm",
  fn: async function () {
    const header: Header = {
      alg: "HS256",
      typ: "JWT",
    };
    const payload = {
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    };
    const jwt = await create(header, payload, keyHS256);
    const validatedPayload = await verify(jwt, keyHS256);
    assertEquals(
      jwt,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o",
    );
    assertEquals(validatedPayload, payload);
    await assertRejects(
      async () => {
        const invalidJwt = // jwt with not supported crypto algorithm in alg header:
          "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.bQTnz6AuMJvmXXQsVPrxeQNvzDkimo7VNXxHeSBfClLufmCVZRUuyTwJF311JHuh";
        await verify(
          invalidJwt,
          keyHS256,
        );
      },
      Error,
      `The jwt's alg 'HS384' does not match the key's algorithm.`,
    );
    await assertRejects(
      async () => {
        const jwtWithInvalidSignature =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzcXNrz0ogthfEd2o";
        await verify(jwtWithInvalidSignature, keyHS256);
      },
      Error,
      "The jwt's signature does not match the verification signature.",
    );
  },
});

Deno.test({
  name: "[jwt] HS384 algorithm",
  fn: async function () {
    const header: Header = { alg: "HS384", typ: "JWT" };
    const payload = {
      sub: "1234567890",
      name: "John Doe",
      admin: true,
      iat: 1516239022,
    };
    const jwt = await create(header, payload, keyHS384);
    const validatedPayload = await verify(jwt, keyHS384);
    assertEquals(validatedPayload, payload);
  },
});

Deno.test({
  name: "[jwt] HS512 algorithm",
  fn: async function () {
    const header: Header = { alg: "HS512", typ: "JWT" };
    const payload = {
      sub: "1234567890",
      name: "John Doe",
      admin: true,
      iat: 1516239022,
    };
    const jwt = await create(header, payload, keyHS512);
    const validatedPayload = await verify(jwt, keyHS512);
    assertEquals(validatedPayload, payload);
  },
});

Deno.test("[jwt] RS256 algorithm", async function (): Promise<void> {
  const header = { alg: "RS256" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyRS256.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyRS256.publicKey,
  );
  assertEquals(receivedPayload, payload);
  await assertRejects(
    async () => {
      await verify(
        jwt,
        keyRS384.publicKey,
      );
    },
    Error,
    `The jwt's alg 'RS256' does not match the key's algorithm.`,
  );
  await assertRejects(
    async () => {
      await verify(
        jwt,
        keyPS256.publicKey,
      );
    },
    Error,
    `The jwt's alg 'RS256' does not match the key's algorithm.`,
  );
});

Deno.test("[jwt] RS384 algorithm", async function (): Promise<void> {
  const header = { alg: "RS384" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyRS384.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyRS384.publicKey,
  );
  assertEquals(receivedPayload, payload);
});
Deno.test("[jwt] RS512 algorithm", async function (): Promise<void> {
  const header = { alg: "RS512" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyRS512.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyRS512.publicKey,
  );
  assertEquals(receivedPayload, payload);
});

Deno.test("[jwt] PS256 algorithm", async function (): Promise<void> {
  const header = { alg: "PS256" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyPS256.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyPS256.publicKey,
  );
  assertEquals(receivedPayload, payload);
});

Deno.test("[jwt] PS384 algorithm", async function (): Promise<void> {
  const header = { alg: "PS384" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyPS384.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyPS384.publicKey,
  );
  assertEquals(receivedPayload, payload);
});

Deno.test("[jwt] PS512 algorithm", async function (): Promise<void> {
  const header = { alg: "PS512" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyPS512.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyPS512.publicKey,
  );
  assertEquals(receivedPayload, payload);
});

Deno.test("[jwt] ES256 algorithm", async function (): Promise<void> {
  const header = { alg: "ES256" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyES256.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyES256.publicKey,
  );
  assertEquals(receivedPayload, payload);
});

Deno.test("[jwt] ES384 algorithm", async function (): Promise<void> {
  const header = { alg: "ES384" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyES384.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyES384.publicKey,
  );
  assertEquals(receivedPayload, payload);
});

// Deno.test("[jwt] ES512 algorithm", async function (): Promise<void> {
// const header = { alg: "ES512" as const, typ: "JWT" };
// const payload = {
// sub: "1234567890",
// name: "John Doe",
// admin: true,
// iat: 1516239022,
// };
// const jwt = await create(header, payload, keyES512.privateKey);
// const receivedPayload = await verify(
// jwt,
// keyES512.publicKey,
// );
// assertEquals(receivedPayload, payload);
// });

Deno.test("[jwt] Pass optional predicates", async function (): Promise<void> {
  const header = { alg: "RS384" as const, typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022,
  };
  const jwt = await create(header, payload, keyRS384.privateKey);
  const receivedPayload = await verify(
    jwt,
    keyRS384.publicKey,
    {
      predicates: [
        (payload) => isDefined(payload.sub),
        (payload) => isString(payload.sub),
      ],
    },
  );
  assertEquals(receivedPayload, payload);
  await assertRejects(
    async () => {
      await verify(
        jwt,
        keyRS384.publicKey,
        {
          predicates: [
            (payload) => isDefined(payload.sub),
            (payload) => isString(payload.sub),
            (payload) => isNull(payload.sub),
          ],
        },
      );
    },
    Error,
    "The payload does not satisfy all passed predicates.",
  );
});

Deno.test("[jwt] getNumericDate", function (): void {
  // A specific date:
  const t1 = getNumericDate(new Date("2020-01-01"));
  const t2 = getNumericDate(new Date("2099-01-01"));
  // Ten seconds from now:
  const t3 = getNumericDate(10);
  // One hour from now:
  const t4 = getNumericDate(60 * 60);
  //  1 second from now:
  const t5 = getNumericDate(1);
  //  1 second earlier:
  const t6 = getNumericDate(-1);
  assertEquals(t1 < Date.now() / 1000, true);
  assertEquals(t2 < Date.now() / 1000, false);
  assertEquals(10, t3 - Math.round(Date.now() / 1000));
  assertEquals(t4 < Date.now() / 1000, false);
  assertEquals(t5 < Date.now() / 1000, false);
  assertEquals(t6 < Date.now() / 1000, true);
  assertEquals(
    getNumericDate(10),
    getNumericDate(new Date(Date.now() + 10000)),
  );
});
