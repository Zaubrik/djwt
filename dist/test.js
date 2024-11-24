// https://jsr.io/@std/encoding/1.0.5/_validate_binary_like.ts
var encoder = new TextEncoder();
function getTypeName(value) {
  const type = typeof value;
  if (type !== "object") {
    return type;
  } else if (value === null) {
    return "null";
  } else {
    return value?.constructor?.name ?? "object";
  }
}
function validateBinaryLike(source) {
  if (typeof source === "string") {
    return encoder.encode(source);
  } else if (source instanceof Uint8Array) {
    return source;
  } else if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }
  throw new TypeError(
    `Cannot validate the input as it must be a Uint8Array, a string, or an ArrayBuffer: received a value of the type ${getTypeName(source)}`
  );
}

// https://jsr.io/@std/encoding/1.0.5/base32.ts
var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split("");
var revLookup = [];
lookup.forEach((c, i) => revLookup[c.charCodeAt(0)] = i);

// https://jsr.io/@std/encoding/1.0.5/base58.ts
var base58alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");

// https://jsr.io/@std/encoding/1.0.5/base64.ts
var base64abc = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/"
];
function encodeBase64(data) {
  const uint8 = validateBinaryLike(data);
  let result = "";
  let i;
  const l = uint8.length;
  for (i = 2; i < l; i += 3) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 15) << 2 | uint8[i] >> 6];
    result += base64abc[uint8[i] & 63];
  }
  if (i === l + 1) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4];
    result += "==";
  }
  if (i === l) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
function decodeBase64(b64) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// https://jsr.io/@std/encoding/1.0.5/base64url.ts
function addPaddingToBase64url(base64url) {
  if (base64url.length % 4 === 2) return base64url + "==";
  if (base64url.length % 4 === 3) return base64url + "=";
  if (base64url.length % 4 === 1) {
    throw new TypeError("Illegal base64url string");
  }
  return base64url;
}
function convertBase64urlToBase64(b64url) {
  if (!/^[-_A-Z0-9]*?={0,2}$/i.test(b64url)) {
    throw new TypeError("Failed to decode base64url: invalid character");
  }
  return addPaddingToBase64url(b64url).replace(/\-/g, "+").replace(/_/g, "/");
}
function convertBase64ToBase64url(b64) {
  return b64.endsWith("=") ? b64.endsWith("==") ? b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -2) : b64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -1) : b64.replace(/\+/g, "-").replace(/\//g, "_");
}
function encodeBase64Url(data) {
  return convertBase64ToBase64url(encodeBase64(data));
}
function decodeBase64Url(b64url) {
  return decodeBase64(convertBase64urlToBase64(b64url));
}

// https://jsr.io/@std/encoding/1.0.5/hex.ts
var hexTable = new TextEncoder().encode("0123456789abcdef");
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder();
function errInvalidByte(byte) {
  return new TypeError(`Invalid byte '${String.fromCharCode(byte)}'`);
}
function errLength(len) {
  return new RangeError(
    `Cannot decode the hex string as the input length should be even: length is ${len}`
  );
}
function fromHexChar(byte) {
  if (48 <= byte && byte <= 57) return byte - 48;
  if (97 <= byte && byte <= 102) return byte - 97 + 10;
  if (65 <= byte && byte <= 70) return byte - 65 + 10;
  throw errInvalidByte(byte);
}
function decodeHex(src) {
  const u8 = textEncoder.encode(src);
  const dst = new Uint8Array(u8.length / 2);
  for (let i = 0; i < dst.length; i++) {
    const a = fromHexChar(u8[i * 2]);
    const b = fromHexChar(u8[i * 2 + 1]);
    dst[i] = a << 4 | b;
  }
  if (u8.length % 2 === 1) {
    fromHexChar(u8[dst.length * 2]);
    throw errLength(u8.length);
  }
  return dst;
}

// https://jsr.io/@std/encoding/1.0.5/varint.ts
var AB = new ArrayBuffer(8);
var U32_VIEW = new Uint32Array(AB);
var U64_VIEW = new BigUint64Array(AB);

// util.ts
var encoder2 = new TextEncoder();
var decoder = new TextDecoder();
function isArray(input) {
  return Array.isArray(input);
}
function isDefined(input) {
  return input !== void 0;
}
function isNotNull(input) {
  return input !== null;
}
function isNotNumber(input) {
  return typeof input !== "number";
}
function isNotString(input) {
  return typeof input !== "string";
}
function isNull(input) {
  return input === null;
}
function isNumber(input) {
  return typeof input === "number";
}
function isNotTrue(input) {
  return input !== true;
}
function isObject(input) {
  return input !== null && typeof input === "object" && Array.isArray(input) === false;
}
function isString(input) {
  return typeof input === "string";
}
function isUndefined(input) {
  return input === void 0;
}

// algorithm.ts
function isHashedKeyAlgorithm(algorithm) {
  return isString(algorithm.hash?.name);
}
function isEcKeyAlgorithm(algorithm) {
  return isString(algorithm.namedCurve);
}
function verify(alg, key) {
  if (alg === "none") {
    if (isNotNull(key)) {
      throw new Error(`The alg '${alg}' does not allow a key.`);
    } else return true;
  } else {
    if (!key) throw new Error(`The alg '${alg}' demands a key.`);
    const keyAlgorithm = key.algorithm;
    const algAlgorithm = getAlgorithm(alg);
    if (keyAlgorithm.name === algAlgorithm.name) {
      if (isHashedKeyAlgorithm(keyAlgorithm)) {
        return keyAlgorithm.hash.name === algAlgorithm.hash.name;
      } else if (isEcKeyAlgorithm(keyAlgorithm)) {
        return keyAlgorithm.namedCurve === algAlgorithm.namedCurve;
      }
    }
    return false;
  }
}
function getAlgorithm(alg) {
  switch (alg) {
    case "HS256":
      return { hash: { name: "SHA-256" }, name: "HMAC" };
    case "HS384":
      return { hash: { name: "SHA-384" }, name: "HMAC" };
    case "HS512":
      return { hash: { name: "SHA-512" }, name: "HMAC" };
    case "PS256":
      return {
        hash: { name: "SHA-256" },
        name: "RSA-PSS",
        saltLength: 256 >> 3
      };
    case "PS384":
      return {
        hash: { name: "SHA-384" },
        name: "RSA-PSS",
        saltLength: 384 >> 3
      };
    case "PS512":
      return {
        hash: { name: "SHA-512" },
        name: "RSA-PSS",
        saltLength: 512 >> 3
      };
    case "RS256":
      return { hash: { name: "SHA-256" }, name: "RSASSA-PKCS1-v1_5" };
    case "RS384":
      return { hash: { name: "SHA-384" }, name: "RSASSA-PKCS1-v1_5" };
    case "RS512":
      return { hash: { name: "SHA-512" }, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
      return { hash: { name: "SHA-256" }, name: "ECDSA", namedCurve: "P-256" };
    case "ES384":
      return { hash: { name: "SHA-384" }, name: "ECDSA", namedCurve: "P-384" };
    // case "ES512":
    // return { hash: { name: "SHA-512" }, name: "ECDSA", namedCurve: "P-521" };
    default:
      throw new Error(`The jwt's alg '${alg}' is not supported.`);
  }
}

// signature.ts
async function verify2(signature, key, alg, signingInput) {
  return isNull(key) ? signature.length === 0 : await crypto.subtle.verify(
    getAlgorithm(alg),
    key,
    signature,
    encoder2.encode(signingInput)
  );
}
async function create(alg, key, signingInput) {
  return isNull(key) ? "" : encodeBase64Url(
    new Uint8Array(
      await crypto.subtle.sign(
        getAlgorithm(alg),
        key,
        encoder2.encode(signingInput)
      )
    )
  );
}

// mod.ts
function isExpired(exp, leeway) {
  return exp + leeway < Date.now() / 1e3;
}
function isTooEarly(nbf, leeway) {
  return nbf - leeway > Date.now() / 1e3;
}
function is3Tuple(arr) {
  return arr.length === 3;
}
function hasInvalidTimingClaims(...claimValues) {
  return claimValues.some(
    (claimValue) => isDefined(claimValue) && isNotNumber(claimValue)
  );
}
function validateTimingClaims(payload2, { expLeeway = 1, nbfLeeway = 1, ignoreExp, ignoreNbf } = {}) {
  if (hasInvalidTimingClaims(payload2.exp, payload2.nbf)) {
    throw new Error(`The jwt has an invalid 'exp' or 'nbf' claim.`);
  }
  if (isNumber(payload2.exp) && isNotTrue(ignoreExp) && isExpired(payload2.exp, expLeeway)) {
    throw RangeError("The jwt is expired.");
  }
  if (isNumber(payload2.nbf) && isNotTrue(ignoreNbf) && isTooEarly(payload2.nbf, nbfLeeway)) {
    throw RangeError("The jwt is used too early.");
  }
}
function hasValidAudClaim(claimValue) {
  if (isUndefined(claimValue) || isString(claimValue)) return true;
  else return isArray(claimValue) && claimValue.every(isString);
}
function validateAudClaim(aud, audience) {
  if (hasValidAudClaim(aud)) {
    if (isUndefined(aud)) {
      throw new Error("The jwt has no 'aud' claim.");
    }
    const audArray = isString(aud) ? [aud] : aud;
    const audienceArrayOrRegex = isString(audience) ? [audience] : audience;
    if (!audArray.some(
      (audString) => isArray(audienceArrayOrRegex) ? audienceArrayOrRegex.includes(audString) : audienceArrayOrRegex.test(audString)
    )) {
      throw new Error(
        "The identification with the value in the 'aud' claim has failed."
      );
    }
  } else {
    throw new Error(`The jwt has an invalid 'aud' claim.`);
  }
}
function decode2(jwt) {
  try {
    const arr = jwt.split(".").map(decodeBase64Url).map(
      (uint8Array, index) => index === 0 || index === 1 ? JSON.parse(decoder.decode(uint8Array)) : uint8Array
    );
    if (is3Tuple(arr)) return arr;
    else throw new Error();
  } catch {
    throw Error("The serialization of the jwt is invalid.");
  }
}
function validate([header2, payload2, signature], options) {
  if (isNotString(header2?.alg)) {
    throw new Error(`The jwt's 'alg' header parameter value must be a string.`);
  }
  if (isObject(payload2)) {
    validateTimingClaims(payload2, options);
    if (isDefined(options?.audience)) {
      validateAudClaim(payload2.aud, options.audience);
    }
    return {
      header: header2,
      payload: payload2,
      signature
    };
  } else {
    throw new Error(`The jwt claims set is not a JSON object.`);
  }
}
async function verify3(jwt, key, options) {
  const { header: header2, payload: payload2, signature } = validate(decode2(jwt), options);
  if (verify(header2.alg, key)) {
    if (!await verify2(
      signature,
      key,
      header2.alg,
      jwt.slice(0, jwt.lastIndexOf("."))
    )) {
      throw new Error(
        "The jwt's signature does not match the verification signature."
      );
    }
    if (!(options?.predicates || []).every((predicate) => predicate(payload2))) {
      throw new Error("The payload does not satisfy all passed predicates.");
    }
    return payload2;
  } else {
    throw new Error(
      `The jwt's alg '${header2.alg}' does not match the key's algorithm.`
    );
  }
}
function createSigningInput(header2, payload2) {
  return `${encodeBase64Url(encoder2.encode(JSON.stringify(header2)))}.${encodeBase64Url(encoder2.encode(JSON.stringify(payload2)))}`;
}
async function create2(header2, payload2, key) {
  if (isObject(payload2)) {
    if (verify(header2.alg, key)) {
      const signingInput = createSigningInput(header2, payload2);
      const signature = await create(header2.alg, key, signingInput);
      return `${signingInput}.${signature}`;
    } else {
      throw new Error(
        `The jwt's alg '${header2.alg}' does not match the key's algorithm.`
      );
    }
  } else {
    throw new Error(`The jwt claims set is not a JSON object.`);
  }
}
function getNumericDate(exp) {
  return Math.round(
    (exp instanceof Date ? exp.getTime() : Date.now() + exp * 1e3) / 1e3
  );
}

// https://jsr.io/@std/assert/1.0.7/assertion_error.ts
var AssertionError = class extends Error {
  /** Constructs a new instance.
   *
   * @param message The error message.
   * @param options Additional options. This argument is still unstable. It may change in the future release.
   */
  constructor(message, options) {
    super(message, options);
    this.name = "AssertionError";
  }
};

// https://jsr.io/@std/assert/1.0.7/equal.ts
function isKeyedCollection(x) {
  return x instanceof Set || x instanceof Map;
}
function constructorsEqual(a, b) {
  return a.constructor === b.constructor || a.constructor === Object && !b.constructor || !a.constructor && b.constructor === Object;
}
function equal(c, d) {
  const seen = /* @__PURE__ */ new Map();
  return function compare(a, b) {
    if (a && b && (a instanceof RegExp && b instanceof RegExp || a instanceof URL && b instanceof URL)) {
      return String(a) === String(b);
    }
    if (a instanceof Date && b instanceof Date) {
      const aTime = a.getTime();
      const bTime = b.getTime();
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
        return true;
      }
      return aTime === bTime;
    }
    if (typeof a === "number" && typeof b === "number") {
      return Number.isNaN(a) && Number.isNaN(b) || a === b;
    }
    if (Object.is(a, b)) {
      return true;
    }
    if (a && typeof a === "object" && b && typeof b === "object") {
      if (a && b && !constructorsEqual(a, b)) {
        return false;
      }
      if (a instanceof WeakMap || b instanceof WeakMap) {
        if (!(a instanceof WeakMap && b instanceof WeakMap)) return false;
        throw new TypeError("cannot compare WeakMap instances");
      }
      if (a instanceof WeakSet || b instanceof WeakSet) {
        if (!(a instanceof WeakSet && b instanceof WeakSet)) return false;
        throw new TypeError("cannot compare WeakSet instances");
      }
      if (a instanceof WeakRef || b instanceof WeakRef) {
        if (!(a instanceof WeakRef && b instanceof WeakRef)) return false;
        return compare(a.deref(), b.deref());
      }
      if (seen.get(a) === b) {
        return true;
      }
      if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
      }
      seen.set(a, b);
      if (isKeyedCollection(a) && isKeyedCollection(b)) {
        if (a.size !== b.size) {
          return false;
        }
        const aKeys = [...a.keys()];
        const primitiveKeysFastPath = aKeys.every((k) => {
          return typeof k === "string" || typeof k === "number" || typeof k === "boolean" || typeof k === "bigint" || typeof k === "symbol" || k == null;
        });
        if (primitiveKeysFastPath) {
          if (a instanceof Set) {
            return a.symmetricDifference(b).size === 0;
          }
          for (const key of aKeys) {
            if (!b.has(key) || !compare(a.get(key), b.get(key))) {
              return false;
            }
          }
          return true;
        }
        let unmatchedEntries = a.size;
        for (const [aKey, aValue] of a.entries()) {
          for (const [bKey, bValue] of b.entries()) {
            if (!compare(aKey, bKey)) continue;
            if (aKey === aValue && bKey === bValue || compare(aValue, bValue)) {
              unmatchedEntries--;
              break;
            }
          }
        }
        return unmatchedEntries === 0;
      }
      const merged = { ...a, ...b };
      for (const key of [
        ...Object.getOwnPropertyNames(merged),
        ...Object.getOwnPropertySymbols(merged)
      ]) {
        if (!compare(a && a[key], b && b[key])) {
          return false;
        }
        if (key in a && !(key in b) || key in b && !(key in a)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }(c, d);
}

// https://jsr.io/@std/internal/1.0.5/format.ts
function format(v) {
  const { Deno: Deno3 } = globalThis;
  return typeof Deno3?.inspect === "function" ? Deno3.inspect(v, {
    depth: Infinity,
    sorted: true,
    trailingComma: true,
    compact: false,
    iterableLimit: Infinity,
    // getters should be true in assertEquals.
    getters: true,
    strAbbreviateSize: Infinity
  }) : `"${String(v).replace(/(?=["\\])/g, "\\")}"`;
}

// https://jsr.io/@std/internal/1.0.5/styles.ts
var { Deno: Deno2 } = globalThis;
var noColor = typeof Deno2?.noColor === "boolean" ? Deno2.noColor : false;
var enabled = !noColor;
function code(open, close) {
  return {
    open: `\x1B[${open.join(";")}m`,
    close: `\x1B[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g")
  };
}
function run(str, code2) {
  return enabled ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}` : str;
}
function bold(str) {
  return run(str, code([1], 22));
}
function red(str) {
  return run(str, code([31], 39));
}
function green(str) {
  return run(str, code([32], 39));
}
function white(str) {
  return run(str, code([37], 39));
}
function gray(str) {
  return brightBlack(str);
}
function brightBlack(str) {
  return run(str, code([90], 39));
}
function bgRed(str) {
  return run(str, code([41], 49));
}
function bgGreen(str) {
  return run(str, code([42], 49));
}
var ANSI_PATTERN = new RegExp(
  [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))"
  ].join("|"),
  "g"
);
function stripAnsiCode(string) {
  return string.replace(ANSI_PATTERN, "");
}

// https://jsr.io/@std/internal/1.0.5/build_message.ts
function createColor(diffType, background = false) {
  switch (diffType) {
    case "added":
      return (s) => background ? bgGreen(white(s)) : green(bold(s));
    case "removed":
      return (s) => background ? bgRed(white(s)) : red(bold(s));
    default:
      return white;
  }
}
function createSign(diffType) {
  switch (diffType) {
    case "added":
      return "+   ";
    case "removed":
      return "-   ";
    default:
      return "    ";
  }
}
function buildMessage(diffResult, options = {}) {
  const { stringDiff = false } = options;
  const messages = [
    "",
    "",
    `    ${gray(bold("[Diff]"))} ${red(bold("Actual"))} / ${green(bold("Expected"))}`,
    "",
    ""
  ];
  const diffMessages = diffResult.map((result) => {
    const color = createColor(result.type);
    const line = result.details?.map(
      (detail) => detail.type !== "common" ? createColor(detail.type, true)(detail.value) : detail.value
    ).join("") ?? result.value;
    return color(`${createSign(result.type)}${line}`);
  });
  messages.push(...stringDiff ? [diffMessages.join("")] : diffMessages, "");
  return messages;
}

// https://jsr.io/@std/internal/1.0.5/diff.ts
var REMOVED = 1;
var COMMON = 2;
var ADDED = 3;
function createCommon(A, B) {
  const common = [];
  if (A.length === 0 || B.length === 0) return [];
  for (let i = 0; i < Math.min(A.length, B.length); i += 1) {
    const a = A[i];
    const b = B[i];
    if (a !== void 0 && a === b) {
      common.push(a);
    } else {
      return common;
    }
  }
  return common;
}
function assertFp(value) {
  if (value == null || typeof value !== "object" || typeof value?.y !== "number" || typeof value?.id !== "number") {
    throw new Error(
      `Unexpected value, expected 'FarthestPoint': received ${typeof value}`
    );
  }
}
function backTrace(A, B, current, swapped, routes, diffTypesPtrOffset) {
  const M = A.length;
  const N = B.length;
  const result = [];
  let a = M - 1;
  let b = N - 1;
  let j = routes[current.id];
  let type = routes[current.id + diffTypesPtrOffset];
  while (true) {
    if (!j && !type) break;
    const prev = j;
    if (type === REMOVED) {
      result.unshift({
        type: swapped ? "removed" : "added",
        value: B[b]
      });
      b -= 1;
    } else if (type === ADDED) {
      result.unshift({
        type: swapped ? "added" : "removed",
        value: A[a]
      });
      a -= 1;
    } else {
      result.unshift({ type: "common", value: A[a] });
      a -= 1;
      b -= 1;
    }
    j = routes[prev];
    type = routes[prev + diffTypesPtrOffset];
  }
  return result;
}
function createFp(k, M, routes, diffTypesPtrOffset, ptr, slide, down) {
  if (slide && slide.y === -1 && down && down.y === -1) {
    return { y: 0, id: 0 };
  }
  const isAdding = down?.y === -1 || k === M || (slide?.y ?? 0) > (down?.y ?? 0) + 1;
  if (slide && isAdding) {
    const prev = slide.id;
    ptr++;
    routes[ptr] = prev;
    routes[ptr + diffTypesPtrOffset] = ADDED;
    return { y: slide.y, id: ptr };
  }
  if (down && !isAdding) {
    const prev = down.id;
    ptr++;
    routes[ptr] = prev;
    routes[ptr + diffTypesPtrOffset] = REMOVED;
    return { y: down.y + 1, id: ptr };
  }
  throw new Error("Unexpected missing FarthestPoint");
}
function diff(A, B) {
  const prefixCommon = createCommon(A, B);
  A = A.slice(prefixCommon.length);
  B = B.slice(prefixCommon.length);
  const swapped = B.length > A.length;
  [A, B] = swapped ? [B, A] : [A, B];
  const M = A.length;
  const N = B.length;
  if (!M && !N && !prefixCommon.length) return [];
  if (!N) {
    return [
      ...prefixCommon.map((value) => ({ type: "common", value })),
      ...A.map((value) => ({ type: swapped ? "added" : "removed", value }))
    ];
  }
  const offset = N;
  const delta = M - N;
  const length = M + N + 1;
  const fp = Array.from({ length }, () => ({ y: -1, id: -1 }));
  const routes = new Uint32Array((M * N + length + 1) * 2);
  const diffTypesPtrOffset = routes.length / 2;
  let ptr = 0;
  function snake(k, A2, B2, slide, down) {
    const M2 = A2.length;
    const N2 = B2.length;
    const fp2 = createFp(k, M2, routes, diffTypesPtrOffset, ptr, slide, down);
    ptr = fp2.id;
    while (fp2.y + k < M2 && fp2.y < N2 && A2[fp2.y + k] === B2[fp2.y]) {
      const prev = fp2.id;
      ptr++;
      fp2.id = ptr;
      fp2.y += 1;
      routes[ptr] = prev;
      routes[ptr + diffTypesPtrOffset] = COMMON;
    }
    return fp2;
  }
  let currentFp = fp[delta + offset];
  assertFp(currentFp);
  let p = -1;
  while (currentFp.y < N) {
    p = p + 1;
    for (let k = -p; k < delta; ++k) {
      const index2 = k + offset;
      fp[index2] = snake(k, A, B, fp[index2 - 1], fp[index2 + 1]);
    }
    for (let k = delta + p; k > delta; --k) {
      const index2 = k + offset;
      fp[index2] = snake(k, A, B, fp[index2 - 1], fp[index2 + 1]);
    }
    const index = delta + offset;
    fp[delta + offset] = snake(delta, A, B, fp[index - 1], fp[index + 1]);
    currentFp = fp[delta + offset];
    assertFp(currentFp);
  }
  return [
    ...prefixCommon.map((value) => ({ type: "common", value })),
    ...backTrace(A, B, currentFp, swapped, routes, diffTypesPtrOffset)
  ];
}

// https://jsr.io/@std/internal/1.0.5/diff_str.ts
function unescape(string) {
  return string.replaceAll("\b", "\\b").replaceAll("\f", "\\f").replaceAll("	", "\\t").replaceAll("\v", "\\v").replaceAll(
    /\r\n|\r|\n/g,
    (str) => str === "\r" ? "\\r" : str === "\n" ? "\\n\n" : "\\r\\n\r\n"
  );
}
var WHITESPACE_SYMBOLS = /([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/;
function tokenize(string, wordDiff = false) {
  if (wordDiff) {
    return string.split(WHITESPACE_SYMBOLS).filter((token) => token);
  }
  const tokens = [];
  const lines = string.split(/(\n|\r\n)/).filter((line) => line);
  for (const [i, line] of lines.entries()) {
    if (i % 2) {
      tokens[tokens.length - 1] += line;
    } else {
      tokens.push(line);
    }
  }
  return tokens;
}
function createDetails(line, tokens) {
  return tokens.filter(({ type }) => type === line.type || type === "common").map((result, i, t) => {
    const token = t[i - 1];
    if (result.type === "common" && token && token.type === t[i + 1]?.type && /\s+/.test(result.value)) {
      return {
        ...result,
        type: token.type
      };
    }
    return result;
  });
}
var NON_WHITESPACE_REGEXP = /\S/;
function diffStr(A, B) {
  const diffResult = diff(
    tokenize(`${unescape(A)}
`),
    tokenize(`${unescape(B)}
`)
  );
  const added = [];
  const removed = [];
  for (const result of diffResult) {
    if (result.type === "added") {
      added.push(result);
    }
    if (result.type === "removed") {
      removed.push(result);
    }
  }
  const hasMoreRemovedLines = added.length < removed.length;
  const aLines = hasMoreRemovedLines ? added : removed;
  const bLines = hasMoreRemovedLines ? removed : added;
  for (const a of aLines) {
    let tokens = [];
    let b;
    while (bLines.length) {
      b = bLines.shift();
      const tokenized = [
        tokenize(a.value, true),
        tokenize(b.value, true)
      ];
      if (hasMoreRemovedLines) tokenized.reverse();
      tokens = diff(tokenized[0], tokenized[1]);
      if (tokens.some(
        ({ type, value }) => type === "common" && NON_WHITESPACE_REGEXP.test(value)
      )) {
        break;
      }
    }
    a.details = createDetails(a, tokens);
    if (b) {
      b.details = createDetails(b, tokens);
    }
  }
  return diffResult;
}

// https://jsr.io/@std/assert/1.0.7/equals.ts
function assertEquals(actual, expected, msg) {
  if (equal(actual, expected)) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  let message = `Values are not equal${msgSuffix}`;
  const actualString = format(actual);
  const expectedString = format(expected);
  const stringDiff = typeof actual === "string" && typeof expected === "string";
  const diffResult = stringDiff ? diffStr(actual, expected) : diff(actualString.split("\n"), expectedString.split("\n"));
  const diffMsg = buildMessage(diffResult, { stringDiff }).join("\n");
  message = `${message}
${diffMsg}`;
  throw new AssertionError(message);
}

// https://jsr.io/@std/assert/1.0.7/is_error.ts
function assertIsError(error, ErrorClass, msgMatches, msg) {
  const msgSuffix = msg ? `: ${msg}` : ".";
  if (!(error instanceof Error)) {
    throw new AssertionError(
      `Expected "error" to be an Error object${msgSuffix}`
    );
  }
  if (ErrorClass && !(error instanceof ErrorClass)) {
    msg = `Expected error to be instance of "${ErrorClass.name}", but was "${error?.constructor?.name}"${msgSuffix}`;
    throw new AssertionError(msg);
  }
  let msgCheck;
  if (typeof msgMatches === "string") {
    msgCheck = stripAnsiCode(error.message).includes(
      stripAnsiCode(msgMatches)
    );
  }
  if (msgMatches instanceof RegExp) {
    msgCheck = msgMatches.test(stripAnsiCode(error.message));
  }
  if (msgMatches && !msgCheck) {
    msg = `Expected error message to include ${msgMatches instanceof RegExp ? msgMatches.toString() : JSON.stringify(msgMatches)}, but got ${JSON.stringify(error?.message)}${msgSuffix}`;
    throw new AssertionError(msg);
  }
}

// https://jsr.io/@std/assert/1.0.7/rejects.ts
async function assertRejects(fn, errorClassOrMsg, msgIncludesOrMsg, msg) {
  let ErrorClass;
  let msgIncludes;
  let err;
  if (typeof errorClassOrMsg !== "string") {
    if (errorClassOrMsg === void 0 || errorClassOrMsg.prototype instanceof Error || errorClassOrMsg.prototype === Error.prototype) {
      ErrorClass = errorClassOrMsg;
      msgIncludes = msgIncludesOrMsg;
    }
  } else {
    msg = errorClassOrMsg;
  }
  let doesThrow = false;
  let isPromiseReturned = false;
  const msgSuffix = msg ? `: ${msg}` : ".";
  try {
    const possiblePromise = fn();
    if (possiblePromise && typeof possiblePromise === "object" && typeof possiblePromise.then === "function") {
      isPromiseReturned = true;
      await possiblePromise;
    } else {
      throw new Error();
    }
  } catch (error) {
    if (!isPromiseReturned) {
      throw new AssertionError(
        `Function throws when expected to reject${msgSuffix}`
      );
    }
    if (ErrorClass) {
      if (!(error instanceof Error)) {
        throw new AssertionError(`A non-Error object was rejected${msgSuffix}`);
      }
      assertIsError(
        error,
        ErrorClass,
        msgIncludes,
        msg
      );
    }
    err = error;
    doesThrow = true;
  }
  if (!doesThrow) {
    throw new AssertionError(
      `Expected function to reject${msgSuffix}`
    );
  }
  return err;
}

// https://jsr.io/@std/assert/1.0.7/throws.ts
function assertThrows(fn, errorClassOrMsg, msgIncludesOrMsg, msg) {
  let ErrorClass;
  let msgIncludes;
  let err;
  if (typeof errorClassOrMsg !== "string") {
    if (errorClassOrMsg === void 0 || errorClassOrMsg?.prototype instanceof Error || errorClassOrMsg?.prototype === Error.prototype) {
      ErrorClass = errorClassOrMsg;
      msgIncludes = msgIncludesOrMsg;
    } else {
      msg = msgIncludesOrMsg;
    }
  } else {
    msg = errorClassOrMsg;
  }
  let doesThrow = false;
  const msgSuffix = msg ? `: ${msg}` : ".";
  try {
    fn();
  } catch (error) {
    if (ErrorClass) {
      if (error instanceof Error === false) {
        throw new AssertionError(`A non-Error object was thrown${msgSuffix}`);
      }
      assertIsError(
        error,
        ErrorClass,
        msgIncludes,
        msg
      );
    }
    err = error;
    doesThrow = true;
  }
  if (!doesThrow) {
    msg = `Expected function to throw${msgSuffix}`;
    throw new AssertionError(msg);
  }
  return err;
}

// tests/test.ts
var header = {
  alg: "HS256",
  typ: "JWT"
};
var payload = {
  name: "John Doe"
};
var keyHS256 = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode("secret"),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);
var keyHS384 = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-384" },
  true,
  ["sign", "verify"]
);
var keyHS512 = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode("secret"),
  { name: "HMAC", hash: "SHA-512" },
  false,
  ["sign", "verify"]
);
var keyRS256 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256"
  },
  true,
  ["verify", "sign"]
);
var keyRS384 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-384"
  },
  true,
  ["verify", "sign"]
);
var keyRS512 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-512"
  },
  true,
  ["verify", "sign"]
);
var keyPS256 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSA-PSS",
    // Consider using a 4096-bit key for systems that require long-term security
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256"
  },
  true,
  ["sign", "verify"]
);
var keyPS384 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSA-PSS",
    // Consider using a 4096-bit key for systems that require long-term security
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-384"
  },
  true,
  ["sign", "verify"]
);
var keyPS512 = await globalThis.crypto.subtle.generateKey(
  {
    name: "RSA-PSS",
    // Consider using a 4096-bit key for systems that require long-term security
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-512"
  },
  true,
  ["sign", "verify"]
);
var keyES256 = await globalThis.crypto.subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-256"
  },
  true,
  ["sign", "verify"]
);
var keyES384 = await globalThis.crypto.subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-384"
  },
  true,
  ["sign", "verify"]
);
Deno.test({
  name: "[jwt] create",
  fn: async function() {
    assertEquals(
      await create2(
        header,
        payload,
        keyHS256
      ),
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds"
    );
    assertEquals(
      await create2(
        {
          alg: "HS512",
          typ: "JWT"
        },
        {},
        keyHS512
      ),
      "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.e30.dGumW8J3t2BlAwqqoisyWDC6ov2hRtjTAFHzd-Tlr4DUScaHG4OYqTHXLHEzd3hU5wy5xs87vRov6QzZnj410g"
    );
    assertEquals(
      await create2({ alg: "HS512", typ: "JWT" }, { foo: "bar" }, keyHS512),
      "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIifQ.WePl7achkd0oGNB8XRF_LJwxlyiPZqpdNgdKpDboAjSTsWq-aOGNynTp8TOv8KjonFym8vwFwppXOLoLXbkIaQ"
    );
    await assertRejects(
      async () => {
        await create2(header, payload, keyHS512);
      },
      Error,
      "The jwt's alg 'HS256' does not match the key's algorithm."
    );
    await assertRejects(
      async () => {
        await create2(header, "invalid payload", keyHS512);
      },
      Error,
      "The jwt claims set is not a JSON object."
    );
  }
});
Deno.test({
  name: "[jwt] verify",
  fn: async function() {
    assertEquals(
      await verify3(
        await create2(header, payload, keyHS256),
        keyHS256
      ),
      payload
    );
    await assertEquals(
      await verify3(
        await create2({ alg: "HS512", typ: "JWT" }, {}, keyHS512),
        keyHS512
      ),
      {}
    );
    await assertEquals(
      await verify3(
        await create2({ alg: "HS512", typ: "JWT" }, {}, keyHS512),
        keyHS512,
        { expLeeway: 10 }
      ),
      {}
    );
    await assertEquals(
      await verify3(
        await create2({ alg: "HS512", typ: "JWT" }, {}, keyHS512),
        keyHS512,
        { nbfLeeway: 10 }
      ),
      {}
    );
    await assertEquals(
      await verify3(
        await create2({ alg: "HS512", typ: "JWT" }, { exp: 0 }, keyHS512),
        keyHS512,
        { ignoreExp: true }
      ),
      { exp: 0 }
    );
    await assertEquals(
      (await verify3(
        await create2(
          { alg: "HS512", typ: "JWT" },
          { email: "joe@example.com" },
          keyHS512
        ),
        keyHS512,
        { ignoreExp: true }
      )).email,
      "joe@example.com"
    );
    await assertEquals(
      await verify3(
        await create2(
          { alg: "HS512", typ: "JWT" },
          { nbf: 1111111111111111e12 },
          keyHS512
        ),
        keyHS512,
        { ignoreNbf: true }
      ),
      { nbf: 1111111111111111e12 }
    );
    await assertRejects(
      async () => {
        await verify3(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsd",
          keyHS256
        );
      },
      Error,
      "The jwt's signature does not match the verification signature."
    );
    await assertRejects(
      async () => {
        await verify3(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOmZhbHNlfQ.LXb8M9J6ar14CTq7shnqDMWmSsoH_zyIHiD44Rqd6uI",
          keyHS512
        );
      },
      Error,
      "The jwt has an invalid 'exp' or 'nbf' claim."
    );
    await assertRejects(
      async () => {
        await verify3("", keyHS512);
      },
      Error,
      "The serialization of the jwt is invalid."
    );
    await assertRejects(
      async () => {
        await verify3("invalid", keyHS512);
      },
      Error,
      "The serialization of the jwt is invalid."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header, {
            // @ts-ignore */
            nbf: "invalid",
            exp: 1e20
          }, keyHS256),
          keyHS256
        );
      },
      Error,
      "The jwt has an invalid 'exp' or 'nbf' claim"
    );
    await assertRejects(
      async () => {
        await verify3(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..F6X5eXaBMszYO1kMrujBGGw4-FTJp2Uld6Daz9v3cu4",
          keyHS256
        );
      },
      Error,
      "The serialization of the jwt is invalid."
    );
    await assertRejects(
      async () => {
        await verify3(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YWJj.uE63kRv-19VnJUBL4OUKaxULtqZ27cJwl8V9IXjJaHg",
          keyHS256
        );
      },
      Error,
      "The serialization of the jwt is invalid."
    );
    await assertRejects(
      async () => {
        await verify3(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.bnVsbA.tv7DbhvALc5Eq2sC61Y9IZlG2G15hvJoug9UO6iwmE_UZOLva8EC-9PURg7IIj6f-F9jFWix8vCn9WaAMHR1AA",
          keyHS512
        );
      },
      Error,
      "The jwt claims set is not a JSON object"
    );
    await assertRejects(
      async () => {
        await verify3(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.dHJ1ZQ.Wmj2Jb9m6FQaZ0rd4AHNR2u9THED_m-aPfGx1w5mtKalrx7NWFS98ZblUNm_Szeugg9CUzhzBfPDyPUA2LTTkA",
          keyHS512
        );
      },
      Error,
      "The jwt claims set is not a JSON object"
    );
    await assertRejects(
      async () => {
        await verify3(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.W10.BqmZ-tVI9a-HDx6PpMiBdMq6lzcaqO9sW6pImw-NRajCCmRrVi6IgMhEw7lvOG6sxhteceVMl8_xFRGverJJWw",
          keyHS512
        );
      },
      Error,
      "The jwt claims set is not a JSON object"
    );
    await assertRejects(
      async () => {
        await verify3(
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.WyJhIiwxLHRydWVd.eVsshnlupuoVv9S5Q7VOj2BkLyZmOSC27fCoXwyq_MG8B95P2GkLDkL8Fo0Su7qoh1G0BxYjVRHgVppTgpuZRw",
          keyHS512
        );
      },
      Error,
      "The jwt claims set is not a JSON object"
    );
  }
});
Deno.test({
  name: "[jwt] decode",
  fn: async function() {
    assertEquals(
      decode2(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.TVCeFl1nnZWUMQkAQKuSo_I97YeIZAS8T1gOkErT7F8"
      ),
      [
        { alg: "HS256", typ: "JWT" },
        {},
        decodeHex(
          "4d509e165d679d959431090040ab92a3f23ded87886404bc4f580e904ad3ec5f"
        )
      ]
    );
    assertThrows(
      () => {
        decode2("aaa");
      },
      Error,
      "The serialization of the jwt is invalid."
    );
    assertThrows(
      () => {
        decode2("a");
      },
      Error,
      "The serialization of the jwt is invalid."
    );
    assertThrows(
      () => {
        decode2("ImEi.ImEi.ImEi.ImEi");
      },
      Error,
      "The serialization of the jwt is invalid."
    );
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const header2 = {
      alg: "HS256",
      typ: "JWT"
    };
    const payload2 = {
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022
    };
    assertEquals(decode2(jwt), [
      header2,
      payload2,
      decodeHex(
        "49f94ac7044948c78a285d904f87f0a4c7897f7e8f3a4eb2255fda750b2cc397"
      )
    ]);
    assertEquals(
      await create2(
        header2,
        payload2,
        await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode("your-256-bit-secret"),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign", "verify"]
        )
      ),
      jwt
    );
  }
});
Deno.test({
  name: "[jwt] validate",
  fn: async function() {
    assertEquals(
      validate(
        [
          { alg: "HS256", typ: "JWT" },
          { exp: 1111111111111111e12 },
          new Uint8Array()
        ]
      ),
      {
        header: { alg: "HS256", typ: "JWT" },
        payload: { exp: 1111111111111111e12 },
        signature: new Uint8Array()
      }
    );
    assertThrows(
      () => {
        validate([, , new Uint8Array()]);
      },
      Error,
      "The jwt's 'alg' header parameter value must be a string."
    );
    assertThrows(
      () => {
        validate([null, {}, new Uint8Array()]);
      },
      Error,
      "The jwt's 'alg' header parameter value must be a string."
    );
    assertThrows(
      () => {
        validate([{ alg: "HS256", typ: "JWT" }, [], new Uint8Array()]);
      },
      Error,
      "The jwt claims set is not a JSON object."
    );
    assertThrows(
      () => {
        validate([{ alg: "HS256" }, { exp: "" }, new Uint8Array()]);
      },
      Error,
      "The jwt has an invalid 'exp' or 'nbf' claim."
    );
    assertThrows(
      () => {
        validate([{ alg: "HS256" }, { exp: 1 }, new Uint8Array()]);
      },
      Error,
      "The jwt is expired."
    );
    assertThrows(
      () => {
        validate([
          { alg: "HS256" },
          { nbf: 1111111111111111e12 },
          new Uint8Array()
        ]);
      },
      Error,
      "The jwt is used too early."
    );
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const header2 = {
      alg: "HS256",
      typ: "JWT"
    };
    const payload2 = {
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022
    };
    assertEquals(decode2(jwt), [
      header2,
      payload2,
      decodeHex(
        "49f94ac7044948c78a285d904f87f0a4c7897f7e8f3a4eb2255fda750b2cc397"
      )
    ]);
    assertEquals(
      await create2(
        header2,
        payload2,
        await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode("your-256-bit-secret"),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign", "verify"]
        )
      ),
      jwt
    );
  }
});
Deno.test({
  name: "[jwt] expired jwt",
  fn: async function() {
    const payload2 = {
      iss: "joe",
      jti: "123456789abc",
      exp: 2e4
    };
    const header2 = {
      alg: "HS256",
      dummy: 100
    };
    await assertRejects(
      async () => {
        await verify3(
          await create2(
            header2,
            { exp: 0 },
            keyHS256
          ),
          keyHS256
        );
      },
      Error,
      "The jwt is expired."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, payload2, keyHS256),
          keyHS256
        );
      },
      Error,
      "The jwt is expired."
    );
  }
});
Deno.test({
  name: "[jwt] too early jwt",
  fn: async function() {
    const payload2 = {
      iss: "joe",
      jti: "123456789abc"
    };
    const header2 = {
      alg: "HS256"
    };
    const lateNbf = Date.now() / 1e3 - 5;
    const earlyNbf = Date.now() / 1e3 + 5;
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, nbf: lateNbf }, keyHS256),
        keyHS256
      ),
      { ...payload2, nbf: lateNbf }
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2, nbf: earlyNbf }, keyHS256),
          keyHS256
        );
      },
      Error,
      "The jwt is used too early."
    );
  }
});
Deno.test({
  name: "[jwt] aud claim",
  fn: async function() {
    const payload2 = {
      iss: "joe"
    };
    const audValue = "smtp";
    const header2 = {
      alg: "HS256"
    };
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, aud: audValue }, keyHS256),
        keyHS256
      ),
      { ...payload2, aud: audValue }
    );
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, aud: [] }, keyHS256),
        keyHS256
      ),
      { ...payload2, aud: [] }
    );
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, aud: [audValue, "sol"] }, keyHS256),
        keyHS256,
        { audience: audValue }
      ),
      { ...payload2, aud: [audValue, "sol"] }
    );
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, aud: [audValue, "sol"] }, keyHS256),
        keyHS256,
        { audience: ["wrong", audValue] }
      ),
      { ...payload2, aud: [audValue, "sol"] }
    );
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, aud: audValue }, keyHS256),
        keyHS256,
        { audience: audValue }
      ),
      { ...payload2, aud: audValue }
    );
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, aud: audValue }, keyHS256),
        keyHS256,
        { audience: [audValue, "sol"] }
      ),
      { ...payload2, aud: audValue }
    );
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, aud: [audValue, "sol"] }, keyHS256),
        keyHS256,
        { audience: new RegExp("^s.*") }
      ),
      { ...payload2, aud: [audValue, "sol"] }
    );
    assertEquals(
      await verify3(
        await create2(header2, { ...payload2, aud: audValue }, keyHS256),
        keyHS256,
        { audience: new RegExp("^s.*") }
      ),
      { ...payload2, aud: audValue }
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2 }, keyHS256),
          keyHS256,
          { audience: audValue }
        );
      },
      Error,
      "The jwt has no 'aud' claim."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(
            header2,
            { ...payload2, aud: 10 },
            keyHS256
          ),
          keyHS256,
          { audience: audValue }
        );
      },
      Error,
      "The jwt has an invalid 'aud' claim."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(
            header2,
            { ...payload2, aud: [void 0] },
            keyHS256
          ),
          keyHS256,
          { audience: audValue }
        );
      },
      Error,
      "The jwt has an invalid 'aud' claim."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2, aud: audValue }, keyHS256),
          keyHS256,
          { audience: new RegExp("^a.*") }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(
            header2,
            { ...payload2, aud: [audValue, "sol"] },
            keyHS256
          ),
          keyHS256,
          { audience: new RegExp("^a.*") }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2, aud: audValue }, keyHS256),
          keyHS256,
          { audience: audValue + "a" }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(
            header2,
            { ...payload2, aud: audValue },
            keyHS256
          ),
          keyHS256,
          { audience: [] }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2, aud: [] }, keyHS256),
          keyHS256,
          { audience: audValue }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2, aud: [] }, keyHS256),
          keyHS256,
          { audience: new RegExp(".*") }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2, aud: audValue }, keyHS256),
          keyHS256,
          { audience: "wrong" }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2, aud: audValue }, keyHS256),
          keyHS256,
          { audience: [] }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
    await assertRejects(
      async () => {
        await verify3(
          await create2(header2, { ...payload2, aud: audValue }, keyHS256),
          keyHS256,
          { audience: ["wrong", "wrong2"] }
        );
      },
      Error,
      "The identification with the value in the 'aud' claim has failed."
    );
  }
});
Deno.test({
  name: "[jwt] none algorithm",
  fn: async function() {
    const payload2 = {
      iss: "joe",
      "http://example.com/is_root": true
    };
    const header2 = {
      alg: "none"
    };
    const jwt = await create2(header2, payload2, null);
    assertEquals(
      jwt,
      "eyJhbGciOiJub25lIn0.eyJpc3MiOiJqb2UiLCJodHRwOi8vZXhhbXBsZS5jb20vaXNfcm9vdCI6dHJ1ZX0."
    );
    const validatedPayload = await verify3(
      jwt,
      null
    );
    assertEquals(validatedPayload, payload2);
    await assertRejects(
      async () => {
        await create2(header2, payload2, keyHS256);
      },
      Error,
      "The alg 'none' does not allow a key."
    );
    await assertRejects(
      async () => {
        await create2({ alg: "HS256" }, payload2, null);
      },
      Error,
      "The alg 'HS256' demands a key."
    );
    await assertRejects(
      async () => {
        await verify3(await create2(header2, payload2, null), keyHS256);
      },
      Error,
      "The alg 'none' does not allow a key."
    );
    await assertRejects(
      async () => {
        await verify3(await create2({ alg: "HS256" }, payload2, keyHS256), null);
      },
      Error,
      "The alg 'HS256' demands a key."
    );
  }
});
Deno.test({
  name: "[jwt] HS256 algorithm",
  fn: async function() {
    const header2 = {
      alg: "HS256",
      typ: "JWT"
    };
    const payload2 = {
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022
    };
    const jwt = await create2(header2, payload2, keyHS256);
    const validatedPayload = await verify3(jwt, keyHS256);
    assertEquals(
      jwt,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o"
    );
    assertEquals(validatedPayload, payload2);
    await assertRejects(
      async () => {
        const invalidJwt = (
          // jwt with not supported crypto algorithm in alg header:
          "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.bQTnz6AuMJvmXXQsVPrxeQNvzDkimo7VNXxHeSBfClLufmCVZRUuyTwJF311JHuh"
        );
        await verify3(
          invalidJwt,
          keyHS256
        );
      },
      Error,
      `The jwt's alg 'HS384' does not match the key's algorithm.`
    );
    await assertRejects(
      async () => {
        const jwtWithInvalidSignature = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzcXNrz0ogthfEd2o";
        await verify3(jwtWithInvalidSignature, keyHS256);
      },
      Error,
      "The jwt's signature does not match the verification signature."
    );
  }
});
Deno.test({
  name: "[jwt] HS384 algorithm",
  fn: async function() {
    const header2 = { alg: "HS384", typ: "JWT" };
    const payload2 = {
      sub: "1234567890",
      name: "John Doe",
      admin: true,
      iat: 1516239022
    };
    const jwt = await create2(header2, payload2, keyHS384);
    const validatedPayload = await verify3(jwt, keyHS384);
    assertEquals(validatedPayload, payload2);
  }
});
Deno.test({
  name: "[jwt] HS512 algorithm",
  fn: async function() {
    const header2 = { alg: "HS512", typ: "JWT" };
    const payload2 = {
      sub: "1234567890",
      name: "John Doe",
      admin: true,
      iat: 1516239022
    };
    const jwt = await create2(header2, payload2, keyHS512);
    const validatedPayload = await verify3(jwt, keyHS512);
    assertEquals(validatedPayload, payload2);
  }
});
Deno.test("[jwt] RS256 algorithm", async function() {
  const header2 = { alg: "RS256", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyRS256.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyRS256.publicKey
  );
  assertEquals(receivedPayload, payload2);
  await assertRejects(
    async () => {
      await verify3(
        jwt,
        keyRS384.publicKey
      );
    },
    Error,
    `The jwt's alg 'RS256' does not match the key's algorithm.`
  );
  await assertRejects(
    async () => {
      await verify3(
        jwt,
        keyPS256.publicKey
      );
    },
    Error,
    `The jwt's alg 'RS256' does not match the key's algorithm.`
  );
});
Deno.test("[jwt] RS384 algorithm", async function() {
  const header2 = { alg: "RS384", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyRS384.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyRS384.publicKey
  );
  assertEquals(receivedPayload, payload2);
});
Deno.test("[jwt] RS512 algorithm", async function() {
  const header2 = { alg: "RS512", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyRS512.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyRS512.publicKey
  );
  assertEquals(receivedPayload, payload2);
});
Deno.test("[jwt] PS256 algorithm", async function() {
  const header2 = { alg: "PS256", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyPS256.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyPS256.publicKey
  );
  assertEquals(receivedPayload, payload2);
});
Deno.test("[jwt] PS384 algorithm", async function() {
  const header2 = { alg: "PS384", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyPS384.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyPS384.publicKey
  );
  assertEquals(receivedPayload, payload2);
});
Deno.test("[jwt] PS512 algorithm", async function() {
  const header2 = { alg: "PS512", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyPS512.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyPS512.publicKey
  );
  assertEquals(receivedPayload, payload2);
});
Deno.test("[jwt] ES256 algorithm", async function() {
  const header2 = { alg: "ES256", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyES256.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyES256.publicKey
  );
  assertEquals(receivedPayload, payload2);
});
Deno.test("[jwt] ES384 algorithm", async function() {
  const header2 = { alg: "ES384", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyES384.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyES384.publicKey
  );
  assertEquals(receivedPayload, payload2);
});
Deno.test("[jwt] Pass optional predicates", async function() {
  const header2 = { alg: "RS384", typ: "JWT" };
  const payload2 = {
    sub: "1234567890",
    name: "John Doe",
    admin: true,
    iat: 1516239022
  };
  const jwt = await create2(header2, payload2, keyRS384.privateKey);
  const receivedPayload = await verify3(
    jwt,
    keyRS384.publicKey,
    {
      predicates: [
        (payload3) => isDefined(payload3.sub),
        (payload3) => isString(payload3.sub)
      ]
    }
  );
  assertEquals(receivedPayload, payload2);
  await assertRejects(
    async () => {
      await verify3(
        jwt,
        keyRS384.publicKey,
        {
          predicates: [
            (payload3) => isDefined(payload3.sub),
            (payload3) => isString(payload3.sub),
            (payload3) => isNull(payload3.sub)
          ]
        }
      );
    },
    Error,
    "The payload does not satisfy all passed predicates."
  );
});
Deno.test("[jwt] getNumericDate", function() {
  const t1 = getNumericDate(/* @__PURE__ */ new Date("2020-01-01"));
  const t2 = getNumericDate(/* @__PURE__ */ new Date("2099-01-01"));
  const t3 = getNumericDate(10);
  const t4 = getNumericDate(60 * 60);
  const t5 = getNumericDate(1);
  const t6 = getNumericDate(-1);
  assertEquals(t1 < Date.now() / 1e3, true);
  assertEquals(t2 < Date.now() / 1e3, false);
  assertEquals(10, t3 - Math.round(Date.now() / 1e3));
  assertEquals(t4 < Date.now() / 1e3, false);
  assertEquals(t5 < Date.now() / 1e3, false);
  assertEquals(t6 < Date.now() / 1e3, true);
  assertEquals(
    getNumericDate(10),
    getNumericDate(new Date(Date.now() + 1e4))
  );
});
