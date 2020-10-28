import {
  create,
  decode,
  getNumericDate,
  Header,
  Payload,
  verify,
} from "../mod.ts";

import {
  assertEquals,
  assertThrows,
  assertThrowsAsync,
  dirname,
  fromFileUrl,
} from "./test_depts.ts";

const header: Header = {
  alg: "HS256",
  typ: "JWT",
};

const payload: Payload = {
  name: "John Doe",
};

const key = "secret";

Deno.test({
  name: "[jwt] create",
  fn: async function () {
    assertEquals(
      await create(
        header,
        payload,
        key,
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
        key,
      ),
      "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.e30.dGumW8J3t2BlAwqqoisyWDC6ov2hRtjTAFHzd-Tlr4DUScaHG4OYqTHXLHEzd3hU5wy5xs87vRov6QzZnj410g",
    );
    assertEquals(
      await create({ alg: "HS512", typ: "JWT" }, { foo: "bar" }, key),
      "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.WePl7achkd0oGNB8XRF_LJwxlyiPZqpdNgdKpDboAjSTsWq-aOGNynTp8TOv8KjonFym8vwFwppXOLoLXbkIaQ",
    );
  },
});

Deno.test({
  name: "[jwt] verify",
  fn: async function () {
    assertEquals(
      await verify(
        await create(header, payload, key),
        key,
        "HS256",
      ),
      payload,
    );
    await assertEquals(
      await verify(
        await create({ alg: "HS512", typ: "JWT" }, {}, key),
        key,
        "HS512",
      ),
      {},
    );

    await assertThrowsAsync(
      async () => {
        // payload = { "exp": false }
        await verify(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOmZhbHNlfQ.LXb8M9J6ar14CTq7shnqDMWmSsoH_zyIHiD44Rqd6uI",
          key,
          "HS512",
        );
      },
      Error,
      "The jwt has an invalid 'exp' or 'nbf' claim.",
    );

    await assertThrowsAsync(
      async () => {
        await verify("", key, "HS512");
      },
      Error,
      "The serialization is invalid.",
    );

    await assertThrowsAsync(
      async () => {
        await verify("invalid", key, "HS512");
      },
      Error,
      "The serialization is invalid.",
    );

    await assertThrowsAsync(
      async () => {
        await verify(
          await create(header, {
            // @ts-ignore */
            exp: "invalid",
          }, key),
          key,
          "HS512",
        );
      },
      Error,
      "The jwt has an invalid 'exp' or 'nbf' claim",
    );

    await assertThrowsAsync(
      async () => {
        await verify(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..F6X5eXaBMszYO1kMrujBGGw4-FTJp2Uld6Daz9v3cu4",
          key,
          "HS256",
        );
      },
      Error,
      "The serialization is invalid.",
    );
    await assertThrowsAsync(
      async () => {
        await verify(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YWJj.uE63kRv-19VnJUBL4OUKaxULtqZ27cJwl8V9IXjJaHg",
          key,
          "HS256",
        );
      },
      Error,
      "The serialization is invalid.",
    );

    await assertThrowsAsync(
      async () => {
        await verify(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.bnVsbA.tv7DbhvALc5Eq2sC61Y9IZlG2G15hvJoug9UO6iwmE_UZOLva8EC-9PURg7IIj6f-F9jFWix8vCn9WaAMHR1AA",
          key,
          "HS512",
        );
      },
      Error,
      "The jwt claims set is not a JSON object",
    );

    await assertThrowsAsync(
      async () => {
        await verify(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.dHJ1ZQ.Wmj2Jb9m6FQaZ0rd4AHNR2u9THED_m-aPfGx1w5mtKalrx7NWFS98ZblUNm_Szeugg9CUzhzBfPDyPUA2LTTkA",
          key,
          "HS512",
        );
      },
      Error,
      "The jwt claims set is not a JSON object",
    );
    await assertThrowsAsync(
      async () => {
        await verify(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.W10.BqmZ-tVI9a-HDx6PpMiBdMq6lzcaqO9sW6pImw-NRajCCmRrVi6IgMhEw7lvOG6sxhteceVMl8_xFRGverJJWw",
          key,
          "HS512",
        );
      },
      Error,
      "The jwt claims set is not a JSON object",
    );
    await assertThrowsAsync(
      async () => {
        await verify(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.WyJhIiwxLHRydWVd.eVsshnlupuoVv9S5Q7VOj2BkLyZmOSC27fCoXwyq_MG8B95P2GkLDkL8Fo0Su7qoh1G0BxYjVRHgVppTgpuZRw",
          key,
          "HS512",
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
      {
        header: { alg: "HS256", typ: "JWT" },
        payload: {},
        signature:
          "4d509e165d679d959431090040ab92a3f23ded87886404bc4f580e904ad3ec5f",
      },
    );
    assertThrows(
      () => {
        decode("aaa");
      },
      TypeError,
      "The serialization is invalid.",
    );

    assertThrows(
      () => {
        decode("a");
      },
      TypeError,
      "Illegal base64url string!",
    );

    assertThrows(
      () => {
        // "ImEi" === base64url("a")
        decode("ImEi.ImEi.ImEi.ImEi");
      },
      TypeError,
      "The serialization is invalid.",
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
    assertEquals(decode(jwt), {
      header,
      payload,
      signature:
        "49f94ac7044948c78a285d904f87f0a4c7897f7e8f3a4eb2255fda750b2cc397",
    });
    assertEquals(
      await create(header, payload, "your-256-bit-secret"),
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

    await assertThrowsAsync(
      async () => {
        await verify(
          await create(
            header,
            { exp: 0 },
            key,
          ),
          key,
          "HS512",
        );
      },
      Error,
      "The jwt is expired.",
    );

    await assertThrowsAsync(
      async () => {
        await verify(
          await create(header, payload, key),
          key,
          "HS256",
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
        await create(header, { ...payload, nbf: lateNbf }, key),
        key,
        "HS256",
      ),
      { ...payload, nbf: lateNbf },
    );
    await assertThrowsAsync(
      async () => {
        await verify(
          await create(header, { ...payload, nbf: earlyNbf }, key),
          key,
          "HS256",
        );
      },
      Error,
      "The jwt is used too early.",
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
    const jwt = await create(header, payload, key);
    assertEquals(
      jwt,
      "eyJhbGciOiJub25lIn0.eyJpc3MiOiJqb2UiLCJodHRwOi8vZXhhbXBsZS5jb20vaXNfcm9vdCI6dHJ1ZX0.",
    );
    const validatedPayload = await verify(
      jwt,
      "keyIsIgnored",
      "none",
    );
    assertEquals(validatedPayload, payload);
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
    const jwt = await create(header, payload, key);
    const validatedPayload = await verify(jwt, key, "HS256");
    assertEquals(
      jwt,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o",
    );
    assertEquals(validatedPayload, payload);
    assertThrowsAsync(
      async () => {
        const invalidJwt = // jwt with not supported crypto algorithm in alg header:
          "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.bQTnz6AuMJvmXXQsVPrxeQNvzDkimo7VNXxHeSBfClLufmCVZRUuyTwJF311JHuh";
        await verify(invalidJwt, "", "HS256");
      },
      Error,
      `The jwt's algorithm does not match the specified algorithm 'HS256'.`,
    );
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
    const jwt = await create(header, payload, key);
    const validatedPayload = await verify(jwt, key, "HS512");
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
  const moduleDir = dirname(fromFileUrl(import.meta.url));
  const publicKey = await Deno.readTextFile(moduleDir + "/certs/public.pem");
  const privateKey = await Deno.readTextFile(moduleDir + "/certs/private.pem");
  const externallyVerifiedJwt =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.POstGetfAytaZS82wHcjoTyoqhMyxXiWdR7Nn7A29DNSl0EiXLdwJ6xC6AfgZWF1bOsS_TuYI3OG85AmiExREkrS6tDfTQ2B3WXlrr-wp5AokiRbz3_oB4OxG-W9KcEEbDRcZc0nH3L7LzYptiy1PtAylQGxHTWZXtGz4ht0bAecBgmpdgXMguEIcoqPJ1n3pIWk_dUZegpqx0Lka21H6XxUTxiy8OcaarA8zdnPUnV6AmNP3ecFawIFYdvJB_cm-GvpCSbr8G8y_Mllj8f4x9nBH8pQux89_6gUY618iYv7tuPWBFfEbLxtF2pZS6YC1aSfLQxeNe8djT9YjpvRZA";
  const jwt = await create(header, payload, privateKey);
  const receivedPayload = await verify(
    jwt,
    publicKey,
    "RS256",
  );
  assertEquals(jwt, externallyVerifiedJwt);
  assertEquals(receivedPayload, payload);
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
