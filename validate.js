// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/base64/base64", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function convertBase64ToUint8Array(data) {
        const binString = atob(data);
        const size = binString.length;
        const bytes = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            bytes[i] = binString.charCodeAt(i);
        }
        return bytes;
    }
    exports_1("convertBase64ToUint8Array", convertBase64ToUint8Array);
    // credit: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
    function convertUint8ArrayToBase64(bytes) {
        const base64abc = (() => {
            const abc = [], A = "A".charCodeAt(0), a = "a".charCodeAt(0), n = "0".charCodeAt(0);
            for (let i = 0; i < 26; ++i) {
                abc.push(String.fromCharCode(A + i));
            }
            for (let i = 0; i < 26; ++i) {
                abc.push(String.fromCharCode(a + i));
            }
            for (let i = 0; i < 10; ++i) {
                abc.push(String.fromCharCode(n + i));
            }
            abc.push("+");
            abc.push("/");
            return abc;
        })();
        let result = "", i, l = bytes.length;
        for (i = 2; i < l; i += 3) {
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
            result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
            result += base64abc[bytes[i] & 0x3f];
        }
        if (i === l + 1) {
            // 1 octet missing
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[(bytes[i - 2] & 0x03) << 4];
            result += "==";
        }
        if (i === l) {
            // 2 octets missing
            result += base64abc[bytes[i - 2] >> 2];
            result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
            result += base64abc[(bytes[i - 1] & 0x0f) << 2];
            result += "=";
        }
        return result;
    }
    exports_1("convertUint8ArrayToBase64", convertUint8ArrayToBase64);
    // ucs-2 string to base64 encoded ascii
    function convertStringToBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
    exports_1("convertStringToBase64", convertStringToBase64);
    // base64 encoded ascii to ucs-2 string
    function convertBase64ToString(str) {
        return decodeURIComponent(escape(atob(str)));
    }
    exports_1("convertBase64ToString", convertBase64ToString);
    return {
        setters: [],
        execute: function () {
        }
    };
});
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std@v0.60.0/encoding/base64", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    /**
     * Converts given data with base64 encoding
     * @param data input to encode
     */
    function encode(data) {
        if (typeof data === "string") {
            return window.btoa(data);
        }
        else {
            const d = new Uint8Array(data);
            let dataString = "";
            for (let i = 0; i < d.length; ++i) {
                dataString += String.fromCharCode(d[i]);
            }
            return window.btoa(dataString);
        }
    }
    exports_2("encode", encode);
    /**
     * Converts given base64 encoded data back to original
     * @param data input to decode
     */
    function decode(data) {
        const binaryString = decodeString(data);
        const binary = new Uint8Array(binaryString.length);
        for (let i = 0; i < binary.length; ++i) {
            binary[i] = binaryString.charCodeAt(i);
        }
        return binary.buffer;
    }
    exports_2("decode", decode);
    /**
     * Decodes data assuming the output is in string type
     * @param data input to decode
     */
    function decodeString(data) {
        return window.atob(data);
    }
    exports_2("decodeString", decodeString);
    return {
        setters: [],
        execute: function () {
        }
    };
});
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std@v0.60.0/encoding/base64url", ["https://deno.land/std@v0.60.0/encoding/base64"], function (exports_3, context_3) {
    "use strict";
    var base64_ts_1;
    var __moduleName = context_3 && context_3.id;
    /*
     * Some variants allow or require omitting the padding '=' signs:
     * https://en.wikipedia.org/wiki/Base64#URL_applications
     */
    function addPaddingToBase64url(base64url) {
        if (base64url.length % 4 === 2)
            return base64url + "==";
        if (base64url.length % 4 === 3)
            return base64url + "=";
        if (base64url.length % 4 === 1)
            throw new TypeError("Illegal base64url string!");
        return base64url;
    }
    exports_3("addPaddingToBase64url", addPaddingToBase64url);
    function convertBase64urlToBase64(base64url) {
        return addPaddingToBase64url(base64url)
            .replace(/\-/g, "+")
            .replace(/_/g, "/");
    }
    function convertBase64ToBase64url(base64) {
        return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    /**
     * Converts given data with base64url encoding.
     * Removes paddings '='.
     * @param data input to encode
     */
    function encode(data) {
        return convertBase64ToBase64url(base64_ts_1.encode(data));
    }
    exports_3("encode", encode);
    /**
     * Converts given base64url encoded data back to original
     * @param data input to decode
     */
    function decode(data) {
        return base64_ts_1.decode(convertBase64urlToBase64(data));
    }
    exports_3("decode", decode);
    return {
        setters: [
            function (base64_ts_1_1) {
                base64_ts_1 = base64_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/base64/base64url", ["file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/base64/base64", "https://deno.land/std@v0.60.0/encoding/base64url"], function (exports_4, context_4) {
    "use strict";
    var base64_ts_2, base64url_ts_1;
    var __moduleName = context_4 && context_4.id;
    function convertBase64urlToBase64(base64url) {
        return base64url_ts_1.addPaddingToBase64url(base64url).replace(/\-/g, "+").replace(/_/g, "/");
    }
    exports_4("convertBase64urlToBase64", convertBase64urlToBase64);
    function convertBase64ToBase64url(base64) {
        return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    exports_4("convertBase64ToBase64url", convertBase64ToBase64url);
    function convertBase64urlToUint8Array(base64url) {
        return base64_ts_2.convertBase64ToUint8Array(convertBase64urlToBase64(base64url));
    }
    exports_4("convertBase64urlToUint8Array", convertBase64urlToUint8Array);
    function convertUint8ArrayToBase64url(uint8Array) {
        return convertBase64ToBase64url(base64_ts_2.convertUint8ArrayToBase64(uint8Array));
    }
    exports_4("convertUint8ArrayToBase64url", convertUint8ArrayToBase64url);
    return {
        setters: [
            function (base64_ts_2_1) {
                base64_ts_2 = base64_ts_2_1;
            },
            function (base64url_ts_1_1) {
                base64url_ts_1 = base64url_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
// Ported from Go
// https://github.com/golang/go/blob/go1.12.5/src/encoding/hex/hex.go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std@v0.56.0/encoding/hex", [], function (exports_5, context_5) {
    "use strict";
    var hextable;
    var __moduleName = context_5 && context_5.id;
    function errInvalidByte(byte) {
        return new Error("encoding/hex: invalid byte: " +
            new TextDecoder().decode(new Uint8Array([byte])));
    }
    exports_5("errInvalidByte", errInvalidByte);
    function errLength() {
        return new Error("encoding/hex: odd length hex string");
    }
    exports_5("errLength", errLength);
    // fromHexChar converts a hex character into its value and a success flag.
    function fromHexChar(byte) {
        switch (true) {
            case 48 <= byte && byte <= 57: // '0' <= byte && byte <= '9'
                return [byte - 48, true];
            case 97 <= byte && byte <= 102: // 'a' <= byte && byte <= 'f'
                return [byte - 97 + 10, true];
            case 65 <= byte && byte <= 70: // 'A' <= byte && byte <= 'F'
                return [byte - 65 + 10, true];
        }
        return [0, false];
    }
    /**
     * EncodedLen returns the length of an encoding of n source bytes. Specifically,
     * it returns n * 2.
     * @param n
     */
    function encodedLen(n) {
        return n * 2;
    }
    exports_5("encodedLen", encodedLen);
    /**
     * Encode encodes `src` into `encodedLen(src.length)` bytes of `dst`.
     * As a convenience, it returns the number of bytes written to `dst`
     * but this value is always `encodedLen(src.length)`.
     * Encode implements hexadecimal encoding.
     * @param dst
     * @param src
     */
    function encode(dst, src) {
        const srcLength = encodedLen(src.length);
        if (dst.length !== srcLength) {
            throw new Error("Out of index.");
        }
        for (let i = 0; i < src.length; i++) {
            const v = src[i];
            dst[i * 2] = hextable[v >> 4];
            dst[i * 2 + 1] = hextable[v & 0x0f];
        }
        return srcLength;
    }
    exports_5("encode", encode);
    /**
     * EncodeToString returns the hexadecimal encoding of `src`.
     * @param src
     */
    function encodeToString(src) {
        const dest = new Uint8Array(encodedLen(src.length));
        encode(dest, src);
        return new TextDecoder().decode(dest);
    }
    exports_5("encodeToString", encodeToString);
    /**
     * Decode decodes `src` into `decodedLen(src.length)` bytes
     * returning the actual number of bytes written to `dst`.
     * Decode expects that `src` contains only hexadecimal characters and that `src`
     * has even length.
     * If the input is malformed, Decode returns the number of bytes decoded before
     * the error.
     * @param dst
     * @param src
     */
    function decode(dst, src) {
        let i = 0;
        for (; i < Math.floor(src.length / 2); i++) {
            const [a, aOK] = fromHexChar(src[i * 2]);
            if (!aOK) {
                return [i, errInvalidByte(src[i * 2])];
            }
            const [b, bOK] = fromHexChar(src[i * 2 + 1]);
            if (!bOK) {
                return [i, errInvalidByte(src[i * 2 + 1])];
            }
            dst[i] = (a << 4) | b;
        }
        if (src.length % 2 == 1) {
            // Check for invalid char before reporting bad length,
            // since the invalid char (if present) is an earlier problem.
            const [, ok] = fromHexChar(src[i * 2]);
            if (!ok) {
                return [i, errInvalidByte(src[i * 2])];
            }
            return [i, errLength()];
        }
        return [i, undefined];
    }
    exports_5("decode", decode);
    /**
     * DecodedLen returns the length of a decoding of `x` source bytes.
     * Specifically, it returns `x / 2`.
     * @param x
     */
    function decodedLen(x) {
        return Math.floor(x / 2);
    }
    exports_5("decodedLen", decodedLen);
    /**
     * DecodeString returns the bytes represented by the hexadecimal string `s`.
     * DecodeString expects that src contains only hexadecimal characters and that
     * src has even length.
     * If the input is malformed, DecodeString will throws an error.
     * @param s the `string` need to decode to `Uint8Array`
     */
    function decodeString(s) {
        const src = new TextEncoder().encode(s);
        // We can use the source slice itself as the destination
        // because the decode loop increments by one and then the 'seen' byte is not
        // used anymore.
        const [n, err] = decode(src, src);
        if (err) {
            throw err;
        }
        return src.slice(0, n);
    }
    exports_5("decodeString", decodeString);
    return {
        setters: [],
        execute: function () {
            hextable = new TextEncoder().encode("0123456789abcdef");
        }
    };
});
/*
 * Adapted to deno from:
 *
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
System.register("https://deno.land/std@v0.56.0/hash/sha256", [], function (exports_6, context_6) {
    "use strict";
    var HEX_CHARS, EXTRA, SHIFT, K, blocks, Sha256, HmacSha256;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            HEX_CHARS = "0123456789abcdef".split("");
            EXTRA = [-2147483648, 8388608, 32768, 128];
            SHIFT = [24, 16, 8, 0];
            // prettier-ignore
            // deno-fmt-ignore
            K = [
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
                0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
                0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
                0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
                0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
                0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
                0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
                0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
                0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
            ];
            blocks = [];
            Sha256 = class Sha256 {
                constructor(is224 = false, sharedMemory = false) {
                    this.#lastByteIndex = 0;
                    this.init(is224, sharedMemory);
                }
                #block;
                #blocks;
                #bytes;
                #finalized;
                #first;
                #h0;
                #h1;
                #h2;
                #h3;
                #h4;
                #h5;
                #h6;
                #h7;
                #hashed;
                #hBytes;
                #is224;
                #lastByteIndex;
                #start;
                init(is224, sharedMemory) {
                    if (sharedMemory) {
                        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
                        this.#blocks = blocks;
                    }
                    else {
                        this.#blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    }
                    if (is224) {
                        this.#h0 = 0xc1059ed8;
                        this.#h1 = 0x367cd507;
                        this.#h2 = 0x3070dd17;
                        this.#h3 = 0xf70e5939;
                        this.#h4 = 0xffc00b31;
                        this.#h5 = 0x68581511;
                        this.#h6 = 0x64f98fa7;
                        this.#h7 = 0xbefa4fa4;
                    }
                    else {
                        // 256
                        this.#h0 = 0x6a09e667;
                        this.#h1 = 0xbb67ae85;
                        this.#h2 = 0x3c6ef372;
                        this.#h3 = 0xa54ff53a;
                        this.#h4 = 0x510e527f;
                        this.#h5 = 0x9b05688c;
                        this.#h6 = 0x1f83d9ab;
                        this.#h7 = 0x5be0cd19;
                    }
                    this.#block = this.#start = this.#bytes = this.#hBytes = 0;
                    this.#finalized = this.#hashed = false;
                    this.#first = true;
                    this.#is224 = is224;
                }
                /** Update hash
                 *
                 * @param message The message you want to hash.
                 */
                update(message) {
                    if (this.#finalized) {
                        return this;
                    }
                    let msg;
                    if (message instanceof ArrayBuffer) {
                        msg = new Uint8Array(message);
                    }
                    else {
                        msg = message;
                    }
                    let index = 0;
                    const length = msg.length;
                    const blocks = this.#blocks;
                    while (index < length) {
                        let i;
                        if (this.#hashed) {
                            this.#hashed = false;
                            blocks[0] = this.#block;
                            blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
                        }
                        if (typeof msg !== "string") {
                            for (i = this.#start; index < length && i < 64; ++index) {
                                blocks[i >> 2] |= msg[index] << SHIFT[i++ & 3];
                            }
                        }
                        else {
                            for (i = this.#start; index < length && i < 64; ++index) {
                                let code = msg.charCodeAt(index);
                                if (code < 0x80) {
                                    blocks[i >> 2] |= code << SHIFT[i++ & 3];
                                }
                                else if (code < 0x800) {
                                    blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                                else if (code < 0xd800 || code >= 0xe000) {
                                    blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                                else {
                                    code =
                                        0x10000 +
                                            (((code & 0x3ff) << 10) | (msg.charCodeAt(++index) & 0x3ff));
                                    blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                            }
                        }
                        this.#lastByteIndex = i;
                        this.#bytes += i - this.#start;
                        if (i >= 64) {
                            this.#block = blocks[16];
                            this.#start = i - 64;
                            this.hash();
                            this.#hashed = true;
                        }
                        else {
                            this.#start = i;
                        }
                    }
                    if (this.#bytes > 4294967295) {
                        this.#hBytes += (this.#bytes / 4294967296) << 0;
                        this.#bytes = this.#bytes % 4294967296;
                    }
                    return this;
                }
                finalize() {
                    if (this.#finalized) {
                        return;
                    }
                    this.#finalized = true;
                    const blocks = this.#blocks;
                    const i = this.#lastByteIndex;
                    blocks[16] = this.#block;
                    blocks[i >> 2] |= EXTRA[i & 3];
                    this.#block = blocks[16];
                    if (i >= 56) {
                        if (!this.#hashed) {
                            this.hash();
                        }
                        blocks[0] = this.#block;
                        blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
                    }
                    blocks[14] = (this.#hBytes << 3) | (this.#bytes >>> 29);
                    blocks[15] = this.#bytes << 3;
                    this.hash();
                }
                hash() {
                    let a = this.#h0;
                    let b = this.#h1;
                    let c = this.#h2;
                    let d = this.#h3;
                    let e = this.#h4;
                    let f = this.#h5;
                    let g = this.#h6;
                    let h = this.#h7;
                    const blocks = this.#blocks;
                    let s0;
                    let s1;
                    let maj;
                    let t1;
                    let t2;
                    let ch;
                    let ab;
                    let da;
                    let cd;
                    let bc;
                    for (let j = 16; j < 64; ++j) {
                        // rightrotate
                        t1 = blocks[j - 15];
                        s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
                        t1 = blocks[j - 2];
                        s1 =
                            ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
                        blocks[j] = (blocks[j - 16] + s0 + blocks[j - 7] + s1) << 0;
                    }
                    bc = b & c;
                    for (let j = 0; j < 64; j += 4) {
                        if (this.#first) {
                            if (this.#is224) {
                                ab = 300032;
                                t1 = blocks[0] - 1413257819;
                                h = (t1 - 150054599) << 0;
                                d = (t1 + 24177077) << 0;
                            }
                            else {
                                ab = 704751109;
                                t1 = blocks[0] - 210244248;
                                h = (t1 - 1521486534) << 0;
                                d = (t1 + 143694565) << 0;
                            }
                            this.#first = false;
                        }
                        else {
                            s0 =
                                ((a >>> 2) | (a << 30)) ^
                                    ((a >>> 13) | (a << 19)) ^
                                    ((a >>> 22) | (a << 10));
                            s1 =
                                ((e >>> 6) | (e << 26)) ^
                                    ((e >>> 11) | (e << 21)) ^
                                    ((e >>> 25) | (e << 7));
                            ab = a & b;
                            maj = ab ^ (a & c) ^ bc;
                            ch = (e & f) ^ (~e & g);
                            t1 = h + s1 + ch + K[j] + blocks[j];
                            t2 = s0 + maj;
                            h = (d + t1) << 0;
                            d = (t1 + t2) << 0;
                        }
                        s0 =
                            ((d >>> 2) | (d << 30)) ^
                                ((d >>> 13) | (d << 19)) ^
                                ((d >>> 22) | (d << 10));
                        s1 =
                            ((h >>> 6) | (h << 26)) ^
                                ((h >>> 11) | (h << 21)) ^
                                ((h >>> 25) | (h << 7));
                        da = d & a;
                        maj = da ^ (d & b) ^ ab;
                        ch = (h & e) ^ (~h & f);
                        t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
                        t2 = s0 + maj;
                        g = (c + t1) << 0;
                        c = (t1 + t2) << 0;
                        s0 =
                            ((c >>> 2) | (c << 30)) ^
                                ((c >>> 13) | (c << 19)) ^
                                ((c >>> 22) | (c << 10));
                        s1 =
                            ((g >>> 6) | (g << 26)) ^
                                ((g >>> 11) | (g << 21)) ^
                                ((g >>> 25) | (g << 7));
                        cd = c & d;
                        maj = cd ^ (c & a) ^ da;
                        ch = (g & h) ^ (~g & e);
                        t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
                        t2 = s0 + maj;
                        f = (b + t1) << 0;
                        b = (t1 + t2) << 0;
                        s0 =
                            ((b >>> 2) | (b << 30)) ^
                                ((b >>> 13) | (b << 19)) ^
                                ((b >>> 22) | (b << 10));
                        s1 =
                            ((f >>> 6) | (f << 26)) ^
                                ((f >>> 11) | (f << 21)) ^
                                ((f >>> 25) | (f << 7));
                        bc = b & c;
                        maj = bc ^ (b & d) ^ cd;
                        ch = (f & g) ^ (~f & h);
                        t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
                        t2 = s0 + maj;
                        e = (a + t1) << 0;
                        a = (t1 + t2) << 0;
                    }
                    this.#h0 = (this.#h0 + a) << 0;
                    this.#h1 = (this.#h1 + b) << 0;
                    this.#h2 = (this.#h2 + c) << 0;
                    this.#h3 = (this.#h3 + d) << 0;
                    this.#h4 = (this.#h4 + e) << 0;
                    this.#h5 = (this.#h5 + f) << 0;
                    this.#h6 = (this.#h6 + g) << 0;
                    this.#h7 = (this.#h7 + h) << 0;
                }
                /** Return hash in hex string. */
                hex() {
                    this.finalize();
                    const h0 = this.#h0;
                    const h1 = this.#h1;
                    const h2 = this.#h2;
                    const h3 = this.#h3;
                    const h4 = this.#h4;
                    const h5 = this.#h5;
                    const h6 = this.#h6;
                    const h7 = this.#h7;
                    let hex = HEX_CHARS[(h0 >> 28) & 0x0f] +
                        HEX_CHARS[(h0 >> 24) & 0x0f] +
                        HEX_CHARS[(h0 >> 20) & 0x0f] +
                        HEX_CHARS[(h0 >> 16) & 0x0f] +
                        HEX_CHARS[(h0 >> 12) & 0x0f] +
                        HEX_CHARS[(h0 >> 8) & 0x0f] +
                        HEX_CHARS[(h0 >> 4) & 0x0f] +
                        HEX_CHARS[h0 & 0x0f] +
                        HEX_CHARS[(h1 >> 28) & 0x0f] +
                        HEX_CHARS[(h1 >> 24) & 0x0f] +
                        HEX_CHARS[(h1 >> 20) & 0x0f] +
                        HEX_CHARS[(h1 >> 16) & 0x0f] +
                        HEX_CHARS[(h1 >> 12) & 0x0f] +
                        HEX_CHARS[(h1 >> 8) & 0x0f] +
                        HEX_CHARS[(h1 >> 4) & 0x0f] +
                        HEX_CHARS[h1 & 0x0f] +
                        HEX_CHARS[(h2 >> 28) & 0x0f] +
                        HEX_CHARS[(h2 >> 24) & 0x0f] +
                        HEX_CHARS[(h2 >> 20) & 0x0f] +
                        HEX_CHARS[(h2 >> 16) & 0x0f] +
                        HEX_CHARS[(h2 >> 12) & 0x0f] +
                        HEX_CHARS[(h2 >> 8) & 0x0f] +
                        HEX_CHARS[(h2 >> 4) & 0x0f] +
                        HEX_CHARS[h2 & 0x0f] +
                        HEX_CHARS[(h3 >> 28) & 0x0f] +
                        HEX_CHARS[(h3 >> 24) & 0x0f] +
                        HEX_CHARS[(h3 >> 20) & 0x0f] +
                        HEX_CHARS[(h3 >> 16) & 0x0f] +
                        HEX_CHARS[(h3 >> 12) & 0x0f] +
                        HEX_CHARS[(h3 >> 8) & 0x0f] +
                        HEX_CHARS[(h3 >> 4) & 0x0f] +
                        HEX_CHARS[h3 & 0x0f] +
                        HEX_CHARS[(h4 >> 28) & 0x0f] +
                        HEX_CHARS[(h4 >> 24) & 0x0f] +
                        HEX_CHARS[(h4 >> 20) & 0x0f] +
                        HEX_CHARS[(h4 >> 16) & 0x0f] +
                        HEX_CHARS[(h4 >> 12) & 0x0f] +
                        HEX_CHARS[(h4 >> 8) & 0x0f] +
                        HEX_CHARS[(h4 >> 4) & 0x0f] +
                        HEX_CHARS[h4 & 0x0f] +
                        HEX_CHARS[(h5 >> 28) & 0x0f] +
                        HEX_CHARS[(h5 >> 24) & 0x0f] +
                        HEX_CHARS[(h5 >> 20) & 0x0f] +
                        HEX_CHARS[(h5 >> 16) & 0x0f] +
                        HEX_CHARS[(h5 >> 12) & 0x0f] +
                        HEX_CHARS[(h5 >> 8) & 0x0f] +
                        HEX_CHARS[(h5 >> 4) & 0x0f] +
                        HEX_CHARS[h5 & 0x0f] +
                        HEX_CHARS[(h6 >> 28) & 0x0f] +
                        HEX_CHARS[(h6 >> 24) & 0x0f] +
                        HEX_CHARS[(h6 >> 20) & 0x0f] +
                        HEX_CHARS[(h6 >> 16) & 0x0f] +
                        HEX_CHARS[(h6 >> 12) & 0x0f] +
                        HEX_CHARS[(h6 >> 8) & 0x0f] +
                        HEX_CHARS[(h6 >> 4) & 0x0f] +
                        HEX_CHARS[h6 & 0x0f];
                    if (!this.#is224) {
                        hex +=
                            HEX_CHARS[(h7 >> 28) & 0x0f] +
                                HEX_CHARS[(h7 >> 24) & 0x0f] +
                                HEX_CHARS[(h7 >> 20) & 0x0f] +
                                HEX_CHARS[(h7 >> 16) & 0x0f] +
                                HEX_CHARS[(h7 >> 12) & 0x0f] +
                                HEX_CHARS[(h7 >> 8) & 0x0f] +
                                HEX_CHARS[(h7 >> 4) & 0x0f] +
                                HEX_CHARS[h7 & 0x0f];
                    }
                    return hex;
                }
                /** Return hash in hex string. */
                toString() {
                    return this.hex();
                }
                /** Return hash in integer array. */
                digest() {
                    this.finalize();
                    const h0 = this.#h0;
                    const h1 = this.#h1;
                    const h2 = this.#h2;
                    const h3 = this.#h3;
                    const h4 = this.#h4;
                    const h5 = this.#h5;
                    const h6 = this.#h6;
                    const h7 = this.#h7;
                    const arr = [
                        (h0 >> 24) & 0xff,
                        (h0 >> 16) & 0xff,
                        (h0 >> 8) & 0xff,
                        h0 & 0xff,
                        (h1 >> 24) & 0xff,
                        (h1 >> 16) & 0xff,
                        (h1 >> 8) & 0xff,
                        h1 & 0xff,
                        (h2 >> 24) & 0xff,
                        (h2 >> 16) & 0xff,
                        (h2 >> 8) & 0xff,
                        h2 & 0xff,
                        (h3 >> 24) & 0xff,
                        (h3 >> 16) & 0xff,
                        (h3 >> 8) & 0xff,
                        h3 & 0xff,
                        (h4 >> 24) & 0xff,
                        (h4 >> 16) & 0xff,
                        (h4 >> 8) & 0xff,
                        h4 & 0xff,
                        (h5 >> 24) & 0xff,
                        (h5 >> 16) & 0xff,
                        (h5 >> 8) & 0xff,
                        h5 & 0xff,
                        (h6 >> 24) & 0xff,
                        (h6 >> 16) & 0xff,
                        (h6 >> 8) & 0xff,
                        h6 & 0xff,
                    ];
                    if (!this.#is224) {
                        arr.push((h7 >> 24) & 0xff, (h7 >> 16) & 0xff, (h7 >> 8) & 0xff, h7 & 0xff);
                    }
                    return arr;
                }
                /** Return hash in integer array. */
                array() {
                    return this.digest();
                }
                /** Return hash in ArrayBuffer. */
                arrayBuffer() {
                    this.finalize();
                    const buffer = new ArrayBuffer(this.#is224 ? 28 : 32);
                    const dataView = new DataView(buffer);
                    dataView.setUint32(0, this.#h0);
                    dataView.setUint32(4, this.#h1);
                    dataView.setUint32(8, this.#h2);
                    dataView.setUint32(12, this.#h3);
                    dataView.setUint32(16, this.#h4);
                    dataView.setUint32(20, this.#h5);
                    dataView.setUint32(24, this.#h6);
                    if (!this.#is224) {
                        dataView.setUint32(28, this.#h7);
                    }
                    return buffer;
                }
            };
            exports_6("Sha256", Sha256);
            HmacSha256 = class HmacSha256 extends Sha256 {
                constructor(secretKey, is224 = false, sharedMemory = false) {
                    super(is224, sharedMemory);
                    let key;
                    if (typeof secretKey === "string") {
                        const bytes = [];
                        const length = secretKey.length;
                        let index = 0;
                        for (let i = 0; i < length; ++i) {
                            let code = secretKey.charCodeAt(i);
                            if (code < 0x80) {
                                bytes[index++] = code;
                            }
                            else if (code < 0x800) {
                                bytes[index++] = 0xc0 | (code >> 6);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                            else if (code < 0xd800 || code >= 0xe000) {
                                bytes[index++] = 0xe0 | (code >> 12);
                                bytes[index++] = 0x80 | ((code >> 6) & 0x3f);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                            else {
                                code =
                                    0x10000 +
                                        (((code & 0x3ff) << 10) | (secretKey.charCodeAt(++i) & 0x3ff));
                                bytes[index++] = 0xf0 | (code >> 18);
                                bytes[index++] = 0x80 | ((code >> 12) & 0x3f);
                                bytes[index++] = 0x80 | ((code >> 6) & 0x3f);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                        }
                        key = bytes;
                    }
                    else {
                        if (secretKey instanceof ArrayBuffer) {
                            key = new Uint8Array(secretKey);
                        }
                        else {
                            key = secretKey;
                        }
                    }
                    if (key.length > 64) {
                        key = new Sha256(is224, true).update(key).array();
                    }
                    const oKeyPad = [];
                    const iKeyPad = [];
                    for (let i = 0; i < 64; ++i) {
                        const b = key[i] || 0;
                        oKeyPad[i] = 0x5c ^ b;
                        iKeyPad[i] = 0x36 ^ b;
                    }
                    this.update(iKeyPad);
                    this.#oKeyPad = oKeyPad;
                    this.#inner = true;
                    this.#is224 = is224;
                    this.#sharedMemory = sharedMemory;
                }
                #inner;
                #is224;
                #oKeyPad;
                #sharedMemory;
                finalize() {
                    super.finalize();
                    if (this.#inner) {
                        this.#inner = false;
                        const innerHash = this.array();
                        super.init(this.#is224, this.#sharedMemory);
                        this.update(this.#oKeyPad);
                        this.update(innerHash);
                        super.finalize();
                    }
                }
            };
            exports_6("HmacSha256", HmacSha256);
        }
    };
});
/*
 * [js-sha512]{@link https://github.com/emn178/js-sha512}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2018
 * @license MIT
 */
System.register("https://deno.land/std@v0.56.0/hash/sha512", [], function (exports_7, context_7) {
    "use strict";
    var HEX_CHARS, EXTRA, SHIFT, K, blocks, Sha512, HmacSha512;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            // prettier-ignore
            HEX_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
            EXTRA = [-2147483648, 8388608, 32768, 128];
            SHIFT = [24, 16, 8, 0];
            // prettier-ignore
            K = [
                0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd, 0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc, 0x3956c25b,
                0xf348b538, 0x59f111f1, 0xb605d019, 0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118, 0xd807aa98, 0xa3030242,
                0x12835b01, 0x45706fbe, 0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2, 0x72be5d74, 0xf27b896f, 0x80deb1fe,
                0x3b1696b1, 0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694, 0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
                0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65, 0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483, 0x5cb0a9dc,
                0xbd41fbd4, 0x76f988da, 0x831153b5, 0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210, 0xb00327c8, 0x98fb213f,
                0xbf597fc7, 0xbeef0ee4, 0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725, 0x06ca6351, 0xe003826f, 0x14292967,
                0x0a0e6e70, 0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926, 0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
                0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8, 0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b, 0xa2bfe8a1,
                0x4cf10364, 0xa81a664b, 0xbc423001, 0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30, 0xd192e819, 0xd6ef5218,
                0xd6990624, 0x5565a910, 0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8, 0x19a4c116, 0xb8d2d0c8, 0x1e376c08,
                0x5141ab53, 0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8, 0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
                0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3, 0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60, 0x84c87814,
                0xa1f0ab72, 0x8cc70208, 0x1a6439ec, 0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9, 0xbef9a3f7, 0xb2c67915,
                0xc67178f2, 0xe372532b, 0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207, 0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f,
                0xee6ed178, 0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6, 0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
                0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493, 0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c, 0x4cc5d4be,
                0xcb3e42b6, 0x597f299c, 0xfc657e2a, 0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
            ];
            blocks = [];
            // prettier-ignore
            Sha512 = class Sha512 {
                constructor(bits = 512, sharedMemory = false) {
                    this.#lastByteIndex = 0;
                    this.init(bits, sharedMemory);
                }
                #blocks;
                #block;
                #bits;
                #start;
                #bytes;
                #hBytes;
                #lastByteIndex;
                #finalized;
                #hashed;
                #h0h;
                #h0l;
                #h1h;
                #h1l;
                #h2h;
                #h2l;
                #h3h;
                #h3l;
                #h4h;
                #h4l;
                #h5h;
                #h5l;
                #h6h;
                #h6l;
                #h7h;
                #h7l;
                init(bits, sharedMemory) {
                    if (sharedMemory) {
                        blocks[0] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] =
                            blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = blocks[16] =
                                blocks[17] = blocks[18] = blocks[19] = blocks[20] = blocks[21] = blocks[22] = blocks[23] = blocks[24] =
                                    blocks[25] = blocks[26] = blocks[27] = blocks[28] = blocks[29] = blocks[30] = blocks[31] = blocks[32] = 0;
                        this.#blocks = blocks;
                    }
                    else {
                        this.#blocks =
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    }
                    if (bits === 224) {
                        this.#h0h = 0x8c3d37c8;
                        this.#h0l = 0x19544da2;
                        this.#h1h = 0x73e19966;
                        this.#h1l = 0x89dcd4d6;
                        this.#h2h = 0x1dfab7ae;
                        this.#h2l = 0x32ff9c82;
                        this.#h3h = 0x679dd514;
                        this.#h3l = 0x582f9fcf;
                        this.#h4h = 0x0f6d2b69;
                        this.#h4l = 0x7bd44da8;
                        this.#h5h = 0x77e36f73;
                        this.#h5l = 0x04c48942;
                        this.#h6h = 0x3f9d85a8;
                        this.#h6l = 0x6a1d36c8;
                        this.#h7h = 0x1112e6ad;
                        this.#h7l = 0x91d692a1;
                    }
                    else if (bits === 256) {
                        this.#h0h = 0x22312194;
                        this.#h0l = 0xfc2bf72c;
                        this.#h1h = 0x9f555fa3;
                        this.#h1l = 0xc84c64c2;
                        this.#h2h = 0x2393b86b;
                        this.#h2l = 0x6f53b151;
                        this.#h3h = 0x96387719;
                        this.#h3l = 0x5940eabd;
                        this.#h4h = 0x96283ee2;
                        this.#h4l = 0xa88effe3;
                        this.#h5h = 0xbe5e1e25;
                        this.#h5l = 0x53863992;
                        this.#h6h = 0x2b0199fc;
                        this.#h6l = 0x2c85b8aa;
                        this.#h7h = 0x0eb72ddc;
                        this.#h7l = 0x81c52ca2;
                    }
                    else if (bits === 384) {
                        this.#h0h = 0xcbbb9d5d;
                        this.#h0l = 0xc1059ed8;
                        this.#h1h = 0x629a292a;
                        this.#h1l = 0x367cd507;
                        this.#h2h = 0x9159015a;
                        this.#h2l = 0x3070dd17;
                        this.#h3h = 0x152fecd8;
                        this.#h3l = 0xf70e5939;
                        this.#h4h = 0x67332667;
                        this.#h4l = 0xffc00b31;
                        this.#h5h = 0x8eb44a87;
                        this.#h5l = 0x68581511;
                        this.#h6h = 0xdb0c2e0d;
                        this.#h6l = 0x64f98fa7;
                        this.#h7h = 0x47b5481d;
                        this.#h7l = 0xbefa4fa4;
                    }
                    else { // 512
                        this.#h0h = 0x6a09e667;
                        this.#h0l = 0xf3bcc908;
                        this.#h1h = 0xbb67ae85;
                        this.#h1l = 0x84caa73b;
                        this.#h2h = 0x3c6ef372;
                        this.#h2l = 0xfe94f82b;
                        this.#h3h = 0xa54ff53a;
                        this.#h3l = 0x5f1d36f1;
                        this.#h4h = 0x510e527f;
                        this.#h4l = 0xade682d1;
                        this.#h5h = 0x9b05688c;
                        this.#h5l = 0x2b3e6c1f;
                        this.#h6h = 0x1f83d9ab;
                        this.#h6l = 0xfb41bd6b;
                        this.#h7h = 0x5be0cd19;
                        this.#h7l = 0x137e2179;
                    }
                    this.#bits = bits;
                    this.#block = this.#start = this.#bytes = this.#hBytes = 0;
                    this.#finalized = this.#hashed = false;
                }
                update(message) {
                    if (this.#finalized) {
                        return this;
                    }
                    let msg;
                    if (message instanceof ArrayBuffer) {
                        msg = new Uint8Array(message);
                    }
                    else {
                        msg = message;
                    }
                    const length = msg.length;
                    const blocks = this.#blocks;
                    let index = 0;
                    while (index < length) {
                        let i;
                        if (this.#hashed) {
                            this.#hashed = false;
                            blocks[0] = this.#block;
                            blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] =
                                blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = blocks[16] =
                                    blocks[17] = blocks[18] = blocks[19] = blocks[20] = blocks[21] = blocks[22] = blocks[23] = blocks[24] =
                                        blocks[25] = blocks[26] = blocks[27] = blocks[28] = blocks[29] = blocks[30] = blocks[31] = blocks[32] = 0;
                        }
                        if (typeof msg !== "string") {
                            for (i = this.#start; index < length && i < 128; ++index) {
                                blocks[i >> 2] |= msg[index] << SHIFT[i++ & 3];
                            }
                        }
                        else {
                            for (i = this.#start; index < length && i < 128; ++index) {
                                let code = msg.charCodeAt(index);
                                if (code < 0x80) {
                                    blocks[i >> 2] |= code << SHIFT[i++ & 3];
                                }
                                else if (code < 0x800) {
                                    blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                                else if (code < 0xd800 || code >= 0xe000) {
                                    blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                                else {
                                    code = 0x10000 + (((code & 0x3ff) << 10) | (msg.charCodeAt(++index) & 0x3ff));
                                    blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                                }
                            }
                        }
                        this.#lastByteIndex = i;
                        this.#bytes += i - this.#start;
                        if (i >= 128) {
                            this.#block = blocks[32];
                            this.#start = i - 128;
                            this.hash();
                            this.#hashed = true;
                        }
                        else {
                            this.#start = i;
                        }
                    }
                    if (this.#bytes > 4294967295) {
                        this.#hBytes += (this.#bytes / 4294967296) << 0;
                        this.#bytes = this.#bytes % 4294967296;
                    }
                    return this;
                }
                finalize() {
                    if (this.#finalized) {
                        return;
                    }
                    this.#finalized = true;
                    const blocks = this.#blocks;
                    const i = this.#lastByteIndex;
                    blocks[32] = this.#block;
                    blocks[i >> 2] |= EXTRA[i & 3];
                    this.#block = blocks[32];
                    if (i >= 112) {
                        if (!this.#hashed) {
                            this.hash();
                        }
                        blocks[0] = this.#block;
                        blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] =
                            blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = blocks[16] =
                                blocks[17] = blocks[18] = blocks[19] = blocks[20] = blocks[21] = blocks[22] = blocks[23] = blocks[24] =
                                    blocks[25] = blocks[26] = blocks[27] = blocks[28] = blocks[29] = blocks[30] = blocks[31] = blocks[32] = 0;
                    }
                    blocks[30] = (this.#hBytes << 3) | (this.#bytes >>> 29);
                    blocks[31] = this.#bytes << 3;
                    this.hash();
                }
                hash() {
                    const h0h = this.#h0h, h0l = this.#h0l, h1h = this.#h1h, h1l = this.#h1l, h2h = this.#h2h, h2l = this.#h2l, h3h = this.#h3h, h3l = this.#h3l, h4h = this.#h4h, h4l = this.#h4l, h5h = this.#h5h, h5l = this.#h5l, h6h = this.#h6h, h6l = this.#h6l, h7h = this.#h7h, h7l = this.#h7l;
                    let s0h, s0l, s1h, s1l, c1, c2, c3, c4, abh, abl, dah, dal, cdh, cdl, bch, bcl, majh, majl, t1h, t1l, t2h, t2l, chh, chl;
                    const blocks = this.#blocks;
                    for (let j = 32; j < 160; j += 2) {
                        t1h = blocks[j - 30];
                        t1l = blocks[j - 29];
                        s0h = ((t1h >>> 1) | (t1l << 31)) ^ ((t1h >>> 8) | (t1l << 24)) ^ (t1h >>> 7);
                        s0l = ((t1l >>> 1) | (t1h << 31)) ^ ((t1l >>> 8) | (t1h << 24)) ^ ((t1l >>> 7) | (t1h << 25));
                        t1h = blocks[j - 4];
                        t1l = blocks[j - 3];
                        s1h = ((t1h >>> 19) | (t1l << 13)) ^ ((t1l >>> 29) | (t1h << 3)) ^ (t1h >>> 6);
                        s1l = ((t1l >>> 19) | (t1h << 13)) ^ ((t1h >>> 29) | (t1l << 3)) ^ ((t1l >>> 6) | (t1h << 26));
                        t1h = blocks[j - 32];
                        t1l = blocks[j - 31];
                        t2h = blocks[j - 14];
                        t2l = blocks[j - 13];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (s0l & 0xffff) + (s1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (s0l >>> 16) + (s1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (s0h & 0xffff) + (s1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (s0h >>> 16) + (s1h >>> 16) + (c3 >>> 16);
                        blocks[j] = (c4 << 16) | (c3 & 0xffff);
                        blocks[j + 1] = (c2 << 16) | (c1 & 0xffff);
                    }
                    let ah = h0h, al = h0l, bh = h1h, bl = h1l, ch = h2h, cl = h2l, dh = h3h, dl = h3l, eh = h4h, el = h4l, fh = h5h, fl = h5l, gh = h6h, gl = h6l, hh = h7h, hl = h7l;
                    bch = bh & ch;
                    bcl = bl & cl;
                    for (let j = 0; j < 160; j += 8) {
                        s0h = ((ah >>> 28) | (al << 4)) ^ ((al >>> 2) | (ah << 30)) ^ ((al >>> 7) | (ah << 25));
                        s0l = ((al >>> 28) | (ah << 4)) ^ ((ah >>> 2) | (al << 30)) ^ ((ah >>> 7) | (al << 25));
                        s1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((el >>> 9) | (eh << 23));
                        s1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((eh >>> 9) | (el << 23));
                        abh = ah & bh;
                        abl = al & bl;
                        majh = abh ^ (ah & ch) ^ bch;
                        majl = abl ^ (al & cl) ^ bcl;
                        chh = (eh & fh) ^ (~eh & gh);
                        chl = (el & fl) ^ (~el & gl);
                        t1h = blocks[j];
                        t1l = blocks[j + 1];
                        t2h = K[j];
                        t2l = K[j + 1];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (chl & 0xffff) + (s1l & 0xffff) + (hl & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (chl >>> 16) + (s1l >>> 16) + (hl >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (chh & 0xffff) + (s1h & 0xffff) + (hh & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (chh >>> 16) + (s1h >>> 16) + (hh >>> 16) + (c3 >>> 16);
                        t1h = (c4 << 16) | (c3 & 0xffff);
                        t1l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (majl & 0xffff) + (s0l & 0xffff);
                        c2 = (majl >>> 16) + (s0l >>> 16) + (c1 >>> 16);
                        c3 = (majh & 0xffff) + (s0h & 0xffff) + (c2 >>> 16);
                        c4 = (majh >>> 16) + (s0h >>> 16) + (c3 >>> 16);
                        t2h = (c4 << 16) | (c3 & 0xffff);
                        t2l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (dl & 0xffff) + (t1l & 0xffff);
                        c2 = (dl >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (dh & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (dh >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        hh = (c4 << 16) | (c3 & 0xffff);
                        hl = (c2 << 16) | (c1 & 0xffff);
                        c1 = (t2l & 0xffff) + (t1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        dh = (c4 << 16) | (c3 & 0xffff);
                        dl = (c2 << 16) | (c1 & 0xffff);
                        s0h = ((dh >>> 28) | (dl << 4)) ^ ((dl >>> 2) | (dh << 30)) ^ ((dl >>> 7) | (dh << 25));
                        s0l = ((dl >>> 28) | (dh << 4)) ^ ((dh >>> 2) | (dl << 30)) ^ ((dh >>> 7) | (dl << 25));
                        s1h = ((hh >>> 14) | (hl << 18)) ^ ((hh >>> 18) | (hl << 14)) ^ ((hl >>> 9) | (hh << 23));
                        s1l = ((hl >>> 14) | (hh << 18)) ^ ((hl >>> 18) | (hh << 14)) ^ ((hh >>> 9) | (hl << 23));
                        dah = dh & ah;
                        dal = dl & al;
                        majh = dah ^ (dh & bh) ^ abh;
                        majl = dal ^ (dl & bl) ^ abl;
                        chh = (hh & eh) ^ (~hh & fh);
                        chl = (hl & el) ^ (~hl & fl);
                        t1h = blocks[j + 2];
                        t1l = blocks[j + 3];
                        t2h = K[j + 2];
                        t2l = K[j + 3];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (chl & 0xffff) + (s1l & 0xffff) + (gl & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (chl >>> 16) + (s1l >>> 16) + (gl >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (chh & 0xffff) + (s1h & 0xffff) + (gh & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (chh >>> 16) + (s1h >>> 16) + (gh >>> 16) + (c3 >>> 16);
                        t1h = (c4 << 16) | (c3 & 0xffff);
                        t1l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (majl & 0xffff) + (s0l & 0xffff);
                        c2 = (majl >>> 16) + (s0l >>> 16) + (c1 >>> 16);
                        c3 = (majh & 0xffff) + (s0h & 0xffff) + (c2 >>> 16);
                        c4 = (majh >>> 16) + (s0h >>> 16) + (c3 >>> 16);
                        t2h = (c4 << 16) | (c3 & 0xffff);
                        t2l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (cl & 0xffff) + (t1l & 0xffff);
                        c2 = (cl >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (ch & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (ch >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        gh = (c4 << 16) | (c3 & 0xffff);
                        gl = (c2 << 16) | (c1 & 0xffff);
                        c1 = (t2l & 0xffff) + (t1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        ch = (c4 << 16) | (c3 & 0xffff);
                        cl = (c2 << 16) | (c1 & 0xffff);
                        s0h = ((ch >>> 28) | (cl << 4)) ^ ((cl >>> 2) | (ch << 30)) ^ ((cl >>> 7) | (ch << 25));
                        s0l = ((cl >>> 28) | (ch << 4)) ^ ((ch >>> 2) | (cl << 30)) ^ ((ch >>> 7) | (cl << 25));
                        s1h = ((gh >>> 14) | (gl << 18)) ^ ((gh >>> 18) | (gl << 14)) ^ ((gl >>> 9) | (gh << 23));
                        s1l = ((gl >>> 14) | (gh << 18)) ^ ((gl >>> 18) | (gh << 14)) ^ ((gh >>> 9) | (gl << 23));
                        cdh = ch & dh;
                        cdl = cl & dl;
                        majh = cdh ^ (ch & ah) ^ dah;
                        majl = cdl ^ (cl & al) ^ dal;
                        chh = (gh & hh) ^ (~gh & eh);
                        chl = (gl & hl) ^ (~gl & el);
                        t1h = blocks[j + 4];
                        t1l = blocks[j + 5];
                        t2h = K[j + 4];
                        t2l = K[j + 5];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (chl & 0xffff) + (s1l & 0xffff) + (fl & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (chl >>> 16) + (s1l >>> 16) + (fl >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (chh & 0xffff) + (s1h & 0xffff) + (fh & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (chh >>> 16) + (s1h >>> 16) + (fh >>> 16) + (c3 >>> 16);
                        t1h = (c4 << 16) | (c3 & 0xffff);
                        t1l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (majl & 0xffff) + (s0l & 0xffff);
                        c2 = (majl >>> 16) + (s0l >>> 16) + (c1 >>> 16);
                        c3 = (majh & 0xffff) + (s0h & 0xffff) + (c2 >>> 16);
                        c4 = (majh >>> 16) + (s0h >>> 16) + (c3 >>> 16);
                        t2h = (c4 << 16) | (c3 & 0xffff);
                        t2l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (bl & 0xffff) + (t1l & 0xffff);
                        c2 = (bl >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (bh & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (bh >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        fh = (c4 << 16) | (c3 & 0xffff);
                        fl = (c2 << 16) | (c1 & 0xffff);
                        c1 = (t2l & 0xffff) + (t1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        bh = (c4 << 16) | (c3 & 0xffff);
                        bl = (c2 << 16) | (c1 & 0xffff);
                        s0h = ((bh >>> 28) | (bl << 4)) ^ ((bl >>> 2) | (bh << 30)) ^ ((bl >>> 7) | (bh << 25));
                        s0l = ((bl >>> 28) | (bh << 4)) ^ ((bh >>> 2) | (bl << 30)) ^ ((bh >>> 7) | (bl << 25));
                        s1h = ((fh >>> 14) | (fl << 18)) ^ ((fh >>> 18) | (fl << 14)) ^ ((fl >>> 9) | (fh << 23));
                        s1l = ((fl >>> 14) | (fh << 18)) ^ ((fl >>> 18) | (fh << 14)) ^ ((fh >>> 9) | (fl << 23));
                        bch = bh & ch;
                        bcl = bl & cl;
                        majh = bch ^ (bh & dh) ^ cdh;
                        majl = bcl ^ (bl & dl) ^ cdl;
                        chh = (fh & gh) ^ (~fh & hh);
                        chl = (fl & gl) ^ (~fl & hl);
                        t1h = blocks[j + 6];
                        t1l = blocks[j + 7];
                        t2h = K[j + 6];
                        t2l = K[j + 7];
                        c1 = (t2l & 0xffff) + (t1l & 0xffff) + (chl & 0xffff) + (s1l & 0xffff) + (el & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (chl >>> 16) + (s1l >>> 16) + (el >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (chh & 0xffff) + (s1h & 0xffff) + (eh & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (chh >>> 16) + (s1h >>> 16) + (eh >>> 16) + (c3 >>> 16);
                        t1h = (c4 << 16) | (c3 & 0xffff);
                        t1l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (majl & 0xffff) + (s0l & 0xffff);
                        c2 = (majl >>> 16) + (s0l >>> 16) + (c1 >>> 16);
                        c3 = (majh & 0xffff) + (s0h & 0xffff) + (c2 >>> 16);
                        c4 = (majh >>> 16) + (s0h >>> 16) + (c3 >>> 16);
                        t2h = (c4 << 16) | (c3 & 0xffff);
                        t2l = (c2 << 16) | (c1 & 0xffff);
                        c1 = (al & 0xffff) + (t1l & 0xffff);
                        c2 = (al >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (ah & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (ah >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        eh = (c4 << 16) | (c3 & 0xffff);
                        el = (c2 << 16) | (c1 & 0xffff);
                        c1 = (t2l & 0xffff) + (t1l & 0xffff);
                        c2 = (t2l >>> 16) + (t1l >>> 16) + (c1 >>> 16);
                        c3 = (t2h & 0xffff) + (t1h & 0xffff) + (c2 >>> 16);
                        c4 = (t2h >>> 16) + (t1h >>> 16) + (c3 >>> 16);
                        ah = (c4 << 16) | (c3 & 0xffff);
                        al = (c2 << 16) | (c1 & 0xffff);
                    }
                    c1 = (h0l & 0xffff) + (al & 0xffff);
                    c2 = (h0l >>> 16) + (al >>> 16) + (c1 >>> 16);
                    c3 = (h0h & 0xffff) + (ah & 0xffff) + (c2 >>> 16);
                    c4 = (h0h >>> 16) + (ah >>> 16) + (c3 >>> 16);
                    this.#h0h = (c4 << 16) | (c3 & 0xffff);
                    this.#h0l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h1l & 0xffff) + (bl & 0xffff);
                    c2 = (h1l >>> 16) + (bl >>> 16) + (c1 >>> 16);
                    c3 = (h1h & 0xffff) + (bh & 0xffff) + (c2 >>> 16);
                    c4 = (h1h >>> 16) + (bh >>> 16) + (c3 >>> 16);
                    this.#h1h = (c4 << 16) | (c3 & 0xffff);
                    this.#h1l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h2l & 0xffff) + (cl & 0xffff);
                    c2 = (h2l >>> 16) + (cl >>> 16) + (c1 >>> 16);
                    c3 = (h2h & 0xffff) + (ch & 0xffff) + (c2 >>> 16);
                    c4 = (h2h >>> 16) + (ch >>> 16) + (c3 >>> 16);
                    this.#h2h = (c4 << 16) | (c3 & 0xffff);
                    this.#h2l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h3l & 0xffff) + (dl & 0xffff);
                    c2 = (h3l >>> 16) + (dl >>> 16) + (c1 >>> 16);
                    c3 = (h3h & 0xffff) + (dh & 0xffff) + (c2 >>> 16);
                    c4 = (h3h >>> 16) + (dh >>> 16) + (c3 >>> 16);
                    this.#h3h = (c4 << 16) | (c3 & 0xffff);
                    this.#h3l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h4l & 0xffff) + (el & 0xffff);
                    c2 = (h4l >>> 16) + (el >>> 16) + (c1 >>> 16);
                    c3 = (h4h & 0xffff) + (eh & 0xffff) + (c2 >>> 16);
                    c4 = (h4h >>> 16) + (eh >>> 16) + (c3 >>> 16);
                    this.#h4h = (c4 << 16) | (c3 & 0xffff);
                    this.#h4l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h5l & 0xffff) + (fl & 0xffff);
                    c2 = (h5l >>> 16) + (fl >>> 16) + (c1 >>> 16);
                    c3 = (h5h & 0xffff) + (fh & 0xffff) + (c2 >>> 16);
                    c4 = (h5h >>> 16) + (fh >>> 16) + (c3 >>> 16);
                    this.#h5h = (c4 << 16) | (c3 & 0xffff);
                    this.#h5l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h6l & 0xffff) + (gl & 0xffff);
                    c2 = (h6l >>> 16) + (gl >>> 16) + (c1 >>> 16);
                    c3 = (h6h & 0xffff) + (gh & 0xffff) + (c2 >>> 16);
                    c4 = (h6h >>> 16) + (gh >>> 16) + (c3 >>> 16);
                    this.#h6h = (c4 << 16) | (c3 & 0xffff);
                    this.#h6l = (c2 << 16) | (c1 & 0xffff);
                    c1 = (h7l & 0xffff) + (hl & 0xffff);
                    c2 = (h7l >>> 16) + (hl >>> 16) + (c1 >>> 16);
                    c3 = (h7h & 0xffff) + (hh & 0xffff) + (c2 >>> 16);
                    c4 = (h7h >>> 16) + (hh >>> 16) + (c3 >>> 16);
                    this.#h7h = (c4 << 16) | (c3 & 0xffff);
                    this.#h7l = (c2 << 16) | (c1 & 0xffff);
                }
                hex() {
                    this.finalize();
                    const h0h = this.#h0h, h0l = this.#h0l, h1h = this.#h1h, h1l = this.#h1l, h2h = this.#h2h, h2l = this.#h2l, h3h = this.#h3h, h3l = this.#h3l, h4h = this.#h4h, h4l = this.#h4l, h5h = this.#h5h, h5l = this.#h5l, h6h = this.#h6h, h6l = this.#h6l, h7h = this.#h7h, h7l = this.#h7l, bits = this.#bits;
                    let hex = HEX_CHARS[(h0h >> 28) & 0x0f] + HEX_CHARS[(h0h >> 24) & 0x0f] +
                        HEX_CHARS[(h0h >> 20) & 0x0f] + HEX_CHARS[(h0h >> 16) & 0x0f] +
                        HEX_CHARS[(h0h >> 12) & 0x0f] + HEX_CHARS[(h0h >> 8) & 0x0f] +
                        HEX_CHARS[(h0h >> 4) & 0x0f] + HEX_CHARS[h0h & 0x0f] +
                        HEX_CHARS[(h0l >> 28) & 0x0f] + HEX_CHARS[(h0l >> 24) & 0x0f] +
                        HEX_CHARS[(h0l >> 20) & 0x0f] + HEX_CHARS[(h0l >> 16) & 0x0f] +
                        HEX_CHARS[(h0l >> 12) & 0x0f] + HEX_CHARS[(h0l >> 8) & 0x0f] +
                        HEX_CHARS[(h0l >> 4) & 0x0f] + HEX_CHARS[h0l & 0x0f] +
                        HEX_CHARS[(h1h >> 28) & 0x0f] + HEX_CHARS[(h1h >> 24) & 0x0f] +
                        HEX_CHARS[(h1h >> 20) & 0x0f] + HEX_CHARS[(h1h >> 16) & 0x0f] +
                        HEX_CHARS[(h1h >> 12) & 0x0f] + HEX_CHARS[(h1h >> 8) & 0x0f] +
                        HEX_CHARS[(h1h >> 4) & 0x0f] + HEX_CHARS[h1h & 0x0f] +
                        HEX_CHARS[(h1l >> 28) & 0x0f] + HEX_CHARS[(h1l >> 24) & 0x0f] +
                        HEX_CHARS[(h1l >> 20) & 0x0f] + HEX_CHARS[(h1l >> 16) & 0x0f] +
                        HEX_CHARS[(h1l >> 12) & 0x0f] + HEX_CHARS[(h1l >> 8) & 0x0f] +
                        HEX_CHARS[(h1l >> 4) & 0x0f] + HEX_CHARS[h1l & 0x0f] +
                        HEX_CHARS[(h2h >> 28) & 0x0f] + HEX_CHARS[(h2h >> 24) & 0x0f] +
                        HEX_CHARS[(h2h >> 20) & 0x0f] + HEX_CHARS[(h2h >> 16) & 0x0f] +
                        HEX_CHARS[(h2h >> 12) & 0x0f] + HEX_CHARS[(h2h >> 8) & 0x0f] +
                        HEX_CHARS[(h2h >> 4) & 0x0f] + HEX_CHARS[h2h & 0x0f] +
                        HEX_CHARS[(h2l >> 28) & 0x0f] + HEX_CHARS[(h2l >> 24) & 0x0f] +
                        HEX_CHARS[(h2l >> 20) & 0x0f] + HEX_CHARS[(h2l >> 16) & 0x0f] +
                        HEX_CHARS[(h2l >> 12) & 0x0f] + HEX_CHARS[(h2l >> 8) & 0x0f] +
                        HEX_CHARS[(h2l >> 4) & 0x0f] + HEX_CHARS[h2l & 0x0f] +
                        HEX_CHARS[(h3h >> 28) & 0x0f] + HEX_CHARS[(h3h >> 24) & 0x0f] +
                        HEX_CHARS[(h3h >> 20) & 0x0f] + HEX_CHARS[(h3h >> 16) & 0x0f] +
                        HEX_CHARS[(h3h >> 12) & 0x0f] + HEX_CHARS[(h3h >> 8) & 0x0f] +
                        HEX_CHARS[(h3h >> 4) & 0x0f] + HEX_CHARS[h3h & 0x0f];
                    if (bits >= 256) {
                        hex +=
                            HEX_CHARS[(h3l >> 28) & 0x0f] + HEX_CHARS[(h3l >> 24) & 0x0f] +
                                HEX_CHARS[(h3l >> 20) & 0x0f] + HEX_CHARS[(h3l >> 16) & 0x0f] +
                                HEX_CHARS[(h3l >> 12) & 0x0f] + HEX_CHARS[(h3l >> 8) & 0x0f] +
                                HEX_CHARS[(h3l >> 4) & 0x0f] + HEX_CHARS[h3l & 0x0f];
                    }
                    if (bits >= 384) {
                        hex +=
                            HEX_CHARS[(h4h >> 28) & 0x0f] + HEX_CHARS[(h4h >> 24) & 0x0f] +
                                HEX_CHARS[(h4h >> 20) & 0x0f] + HEX_CHARS[(h4h >> 16) & 0x0f] +
                                HEX_CHARS[(h4h >> 12) & 0x0f] + HEX_CHARS[(h4h >> 8) & 0x0f] +
                                HEX_CHARS[(h4h >> 4) & 0x0f] + HEX_CHARS[h4h & 0x0f] +
                                HEX_CHARS[(h4l >> 28) & 0x0f] + HEX_CHARS[(h4l >> 24) & 0x0f] +
                                HEX_CHARS[(h4l >> 20) & 0x0f] + HEX_CHARS[(h4l >> 16) & 0x0f] +
                                HEX_CHARS[(h4l >> 12) & 0x0f] + HEX_CHARS[(h4l >> 8) & 0x0f] +
                                HEX_CHARS[(h4l >> 4) & 0x0f] + HEX_CHARS[h4l & 0x0f] +
                                HEX_CHARS[(h5h >> 28) & 0x0f] + HEX_CHARS[(h5h >> 24) & 0x0f] +
                                HEX_CHARS[(h5h >> 20) & 0x0f] + HEX_CHARS[(h5h >> 16) & 0x0f] +
                                HEX_CHARS[(h5h >> 12) & 0x0f] + HEX_CHARS[(h5h >> 8) & 0x0f] +
                                HEX_CHARS[(h5h >> 4) & 0x0f] + HEX_CHARS[h5h & 0x0f] +
                                HEX_CHARS[(h5l >> 28) & 0x0f] + HEX_CHARS[(h5l >> 24) & 0x0f] +
                                HEX_CHARS[(h5l >> 20) & 0x0f] + HEX_CHARS[(h5l >> 16) & 0x0f] +
                                HEX_CHARS[(h5l >> 12) & 0x0f] + HEX_CHARS[(h5l >> 8) & 0x0f] +
                                HEX_CHARS[(h5l >> 4) & 0x0f] + HEX_CHARS[h5l & 0x0f];
                    }
                    if (bits === 512) {
                        hex +=
                            HEX_CHARS[(h6h >> 28) & 0x0f] + HEX_CHARS[(h6h >> 24) & 0x0f] +
                                HEX_CHARS[(h6h >> 20) & 0x0f] + HEX_CHARS[(h6h >> 16) & 0x0f] +
                                HEX_CHARS[(h6h >> 12) & 0x0f] + HEX_CHARS[(h6h >> 8) & 0x0f] +
                                HEX_CHARS[(h6h >> 4) & 0x0f] + HEX_CHARS[h6h & 0x0f] +
                                HEX_CHARS[(h6l >> 28) & 0x0f] + HEX_CHARS[(h6l >> 24) & 0x0f] +
                                HEX_CHARS[(h6l >> 20) & 0x0f] + HEX_CHARS[(h6l >> 16) & 0x0f] +
                                HEX_CHARS[(h6l >> 12) & 0x0f] + HEX_CHARS[(h6l >> 8) & 0x0f] +
                                HEX_CHARS[(h6l >> 4) & 0x0f] + HEX_CHARS[h6l & 0x0f] +
                                HEX_CHARS[(h7h >> 28) & 0x0f] + HEX_CHARS[(h7h >> 24) & 0x0f] +
                                HEX_CHARS[(h7h >> 20) & 0x0f] + HEX_CHARS[(h7h >> 16) & 0x0f] +
                                HEX_CHARS[(h7h >> 12) & 0x0f] + HEX_CHARS[(h7h >> 8) & 0x0f] +
                                HEX_CHARS[(h7h >> 4) & 0x0f] + HEX_CHARS[h7h & 0x0f] +
                                HEX_CHARS[(h7l >> 28) & 0x0f] + HEX_CHARS[(h7l >> 24) & 0x0f] +
                                HEX_CHARS[(h7l >> 20) & 0x0f] + HEX_CHARS[(h7l >> 16) & 0x0f] +
                                HEX_CHARS[(h7l >> 12) & 0x0f] + HEX_CHARS[(h7l >> 8) & 0x0f] +
                                HEX_CHARS[(h7l >> 4) & 0x0f] + HEX_CHARS[h7l & 0x0f];
                    }
                    return hex;
                }
                toString() {
                    return this.hex();
                }
                digest() {
                    this.finalize();
                    const h0h = this.#h0h, h0l = this.#h0l, h1h = this.#h1h, h1l = this.#h1l, h2h = this.#h2h, h2l = this.#h2l, h3h = this.#h3h, h3l = this.#h3l, h4h = this.#h4h, h4l = this.#h4l, h5h = this.#h5h, h5l = this.#h5l, h6h = this.#h6h, h6l = this.#h6l, h7h = this.#h7h, h7l = this.#h7l, bits = this.#bits;
                    const arr = [
                        (h0h >> 24) & 0xff, (h0h >> 16) & 0xff, (h0h >> 8) & 0xff, h0h & 0xff,
                        (h0l >> 24) & 0xff, (h0l >> 16) & 0xff, (h0l >> 8) & 0xff, h0l & 0xff,
                        (h1h >> 24) & 0xff, (h1h >> 16) & 0xff, (h1h >> 8) & 0xff, h1h & 0xff,
                        (h1l >> 24) & 0xff, (h1l >> 16) & 0xff, (h1l >> 8) & 0xff, h1l & 0xff,
                        (h2h >> 24) & 0xff, (h2h >> 16) & 0xff, (h2h >> 8) & 0xff, h2h & 0xff,
                        (h2l >> 24) & 0xff, (h2l >> 16) & 0xff, (h2l >> 8) & 0xff, h2l & 0xff,
                        (h3h >> 24) & 0xff, (h3h >> 16) & 0xff, (h3h >> 8) & 0xff, h3h & 0xff
                    ];
                    if (bits >= 256) {
                        arr.push((h3l >> 24) & 0xff, (h3l >> 16) & 0xff, (h3l >> 8) & 0xff, h3l & 0xff);
                    }
                    if (bits >= 384) {
                        arr.push((h4h >> 24) & 0xff, (h4h >> 16) & 0xff, (h4h >> 8) & 0xff, h4h & 0xff, (h4l >> 24) & 0xff, (h4l >> 16) & 0xff, (h4l >> 8) & 0xff, h4l & 0xff, (h5h >> 24) & 0xff, (h5h >> 16) & 0xff, (h5h >> 8) & 0xff, h5h & 0xff, (h5l >> 24) & 0xff, (h5l >> 16) & 0xff, (h5l >> 8) & 0xff, h5l & 0xff);
                    }
                    if (bits === 512) {
                        arr.push((h6h >> 24) & 0xff, (h6h >> 16) & 0xff, (h6h >> 8) & 0xff, h6h & 0xff, (h6l >> 24) & 0xff, (h6l >> 16) & 0xff, (h6l >> 8) & 0xff, h6l & 0xff, (h7h >> 24) & 0xff, (h7h >> 16) & 0xff, (h7h >> 8) & 0xff, h7h & 0xff, (h7l >> 24) & 0xff, (h7l >> 16) & 0xff, (h7l >> 8) & 0xff, h7l & 0xff);
                    }
                    return arr;
                }
                array() {
                    return this.digest();
                }
                arrayBuffer() {
                    this.finalize();
                    const bits = this.#bits;
                    const buffer = new ArrayBuffer(bits / 8);
                    const dataView = new DataView(buffer);
                    dataView.setUint32(0, this.#h0h);
                    dataView.setUint32(4, this.#h0l);
                    dataView.setUint32(8, this.#h1h);
                    dataView.setUint32(12, this.#h1l);
                    dataView.setUint32(16, this.#h2h);
                    dataView.setUint32(20, this.#h2l);
                    dataView.setUint32(24, this.#h3h);
                    if (bits >= 256) {
                        dataView.setUint32(28, this.#h3l);
                    }
                    if (bits >= 384) {
                        dataView.setUint32(32, this.#h4h);
                        dataView.setUint32(36, this.#h4l);
                        dataView.setUint32(40, this.#h5h);
                        dataView.setUint32(44, this.#h5l);
                    }
                    if (bits === 512) {
                        dataView.setUint32(48, this.#h6h);
                        dataView.setUint32(52, this.#h6l);
                        dataView.setUint32(56, this.#h7h);
                        dataView.setUint32(60, this.#h7l);
                    }
                    return buffer;
                }
            };
            exports_7("Sha512", Sha512);
            HmacSha512 = class HmacSha512 extends Sha512 {
                constructor(secretKey, bits = 512, sharedMemory = false) {
                    super(bits, sharedMemory);
                    let key;
                    if (secretKey instanceof ArrayBuffer) {
                        key = new Uint8Array(secretKey);
                    }
                    else if (typeof secretKey === "string") {
                        const bytes = [];
                        const length = secretKey.length;
                        let index = 0;
                        let code;
                        for (let i = 0; i < length; ++i) {
                            code = secretKey.charCodeAt(i);
                            if (code < 0x80) {
                                bytes[index++] = code;
                            }
                            else if (code < 0x800) {
                                bytes[index++] = 0xc0 | (code >> 6);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                            else if (code < 0xd800 || code >= 0xe000) {
                                bytes[index++] = 0xe0 | (code >> 12);
                                bytes[index++] = 0x80 | ((code >> 6) & 0x3f);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                            else {
                                code =
                                    0x10000 +
                                        (((code & 0x3ff) << 10) | (secretKey.charCodeAt(++i) & 0x3ff));
                                bytes[index++] = 0xf0 | (code >> 18);
                                bytes[index++] = 0x80 | ((code >> 12) & 0x3f);
                                bytes[index++] = 0x80 | ((code >> 6) & 0x3f);
                                bytes[index++] = 0x80 | (code & 0x3f);
                            }
                        }
                        key = bytes;
                    }
                    else {
                        key = secretKey;
                    }
                    if (key.length > 128) {
                        key = new Sha512(bits, true).update(key).array();
                    }
                    const oKeyPad = [];
                    const iKeyPad = [];
                    for (let i = 0; i < 128; ++i) {
                        const b = key[i] || 0;
                        oKeyPad[i] = 0x5c ^ b;
                        iKeyPad[i] = 0x36 ^ b;
                    }
                    this.update(iKeyPad);
                    this.#inner = true;
                    this.#bits = bits;
                    this.#oKeyPad = oKeyPad;
                    this.#sharedMemory = sharedMemory;
                }
                #inner;
                #bits;
                #oKeyPad;
                #sharedMemory;
                finalize() {
                    super.finalize();
                    if (this.#inner) {
                        this.#inner = false;
                        const innerHash = this.array();
                        super.init(this.#bits, this.#sharedMemory);
                        this.update(this.#oKeyPad);
                        this.update(innerHash);
                        super.finalize();
                    }
                }
            };
            exports_7("HmacSha512", HmacSha512);
        }
    };
});
System.register("file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/create", ["file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/base64/base64url", "https://deno.land/std@v0.56.0/encoding/hex", "https://deno.land/std@v0.56.0/hash/sha256", "https://deno.land/std@v0.56.0/hash/sha512"], function (exports_8, context_8) {
    "use strict";
    var base64url_ts_2, hex_ts_1, sha256_ts_1, sha512_ts_1;
    var __moduleName = context_8 && context_8.id;
    // Helper function: setExpiration()
    // returns the number of milliseconds since January 1, 1970, 00:00:00 UTC
    function setExpiration(exp) {
        return (exp instanceof Date ? exp : new Date(exp)).getTime();
    }
    exports_8("setExpiration", setExpiration);
    function convertHexToBase64url(input) {
        return base64url_ts_2.convertUint8ArrayToBase64url(hex_ts_1.decodeString(input));
    }
    exports_8("convertHexToBase64url", convertHexToBase64url);
    function convertStringToBase64url(input) {
        return base64url_ts_2.convertUint8ArrayToBase64url(new TextEncoder().encode(input));
    }
    exports_8("convertStringToBase64url", convertStringToBase64url);
    function makeSigningInput(header, payload) {
        return `${convertStringToBase64url(JSON.stringify(header))}.${convertStringToBase64url(JSON.stringify(payload || ""))}`;
    }
    function encrypt(alg, key, msg) {
        function assertNever(alg) {
            throw new RangeError("no matching crypto algorithm in the header: " + alg);
        }
        switch (alg) {
            case "none":
                return null;
            case "HS256":
                return new sha256_ts_1.HmacSha256(key).update(msg).toString();
            case "HS512":
                return new sha512_ts_1.HmacSha512(key).update(msg).toString();
            default:
                assertNever(alg);
        }
    }
    function makeSignature(alg, key, input) {
        const encryptionInHex = encrypt(alg, key, input);
        return encryptionInHex ? convertHexToBase64url(encryptionInHex) : "";
    }
    exports_8("makeSignature", makeSignature);
    function makeJwt({ key, header, payload }) {
        try {
            const signingInput = makeSigningInput(header, payload);
            return `${signingInput}.${makeSignature(header.alg, key, signingInput)}`;
        }
        catch (err) {
            err.message = `Failed to create JWT: ${err.message}`;
            throw err;
        }
    }
    exports_8("makeJwt", makeJwt);
    return {
        setters: [
            function (base64url_ts_2_1) {
                base64url_ts_2 = base64url_ts_2_1;
            },
            function (hex_ts_1_1) {
                hex_ts_1 = hex_ts_1_1;
            },
            function (sha256_ts_1_1) {
                sha256_ts_1 = sha256_ts_1_1;
            },
            function (sha512_ts_1_1) {
                sha512_ts_1 = sha512_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
// Ported from Go
// https://github.com/golang/go/blob/go1.12.5/src/encoding/hex/hex.go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std@v0.60.0/encoding/hex", [], function (exports_9, context_9) {
    "use strict";
    var hextable;
    var __moduleName = context_9 && context_9.id;
    function errInvalidByte(byte) {
        return new Error("encoding/hex: invalid byte: " +
            new TextDecoder().decode(new Uint8Array([byte])));
    }
    exports_9("errInvalidByte", errInvalidByte);
    function errLength() {
        return new Error("encoding/hex: odd length hex string");
    }
    exports_9("errLength", errLength);
    // fromHexChar converts a hex character into its value and a success flag.
    function fromHexChar(byte) {
        switch (true) {
            case 48 <= byte && byte <= 57: // '0' <= byte && byte <= '9'
                return [byte - 48, true];
            case 97 <= byte && byte <= 102: // 'a' <= byte && byte <= 'f'
                return [byte - 97 + 10, true];
            case 65 <= byte && byte <= 70: // 'A' <= byte && byte <= 'F'
                return [byte - 65 + 10, true];
        }
        return [0, false];
    }
    /**
     * EncodedLen returns the length of an encoding of n source bytes. Specifically,
     * it returns n * 2.
     * @param n
     */
    function encodedLen(n) {
        return n * 2;
    }
    exports_9("encodedLen", encodedLen);
    /**
     * Encode encodes `src` into `encodedLen(src.length)` bytes of `dst`.
     * As a convenience, it returns the number of bytes written to `dst`
     * but this value is always `encodedLen(src.length)`.
     * Encode implements hexadecimal encoding.
     * @param dst
     * @param src
     */
    function encode(src, dst) {
        const srcLength = encodedLen(src.length);
        if (dst.length !== srcLength) {
            throw new Error("Out of index.");
        }
        for (let i = 0; i < src.length; i++) {
            const v = src[i];
            dst[i * 2] = hextable[v >> 4];
            dst[i * 2 + 1] = hextable[v & 0x0f];
        }
        return srcLength;
    }
    exports_9("encode", encode);
    /**
     * EncodeToString returns the hexadecimal encoding of `src`.
     * @param src
     */
    function encodeToString(src) {
        const dest = new Uint8Array(encodedLen(src.length));
        encode(src, dest);
        return new TextDecoder().decode(dest);
    }
    exports_9("encodeToString", encodeToString);
    /**
     * Decode decodes `src` into `decodedLen(src.length)` bytes
     * returning the actual number of bytes written to `dst`.
     * Decode expects that `src` contains only hexadecimal characters and that `src`
     * has even length.
     * If the input is malformed, Decode returns the number of bytes decoded before
     * the error.
     * @param dst
     * @param src
     */
    function decode(src, dst) {
        let i = 0;
        for (; i < Math.floor(src.length / 2); i++) {
            const [a, aOK] = fromHexChar(src[i * 2]);
            if (!aOK) {
                return [i, errInvalidByte(src[i * 2])];
            }
            const [b, bOK] = fromHexChar(src[i * 2 + 1]);
            if (!bOK) {
                return [i, errInvalidByte(src[i * 2 + 1])];
            }
            dst[i] = (a << 4) | b;
        }
        if (src.length % 2 == 1) {
            // Check for invalid char before reporting bad length,
            // since the invalid char (if present) is an earlier problem.
            const [, ok] = fromHexChar(src[i * 2]);
            if (!ok) {
                return [i, errInvalidByte(src[i * 2])];
            }
            return [i, errLength()];
        }
        return [i, undefined];
    }
    exports_9("decode", decode);
    /**
     * DecodedLen returns the length of a decoding of `x` source bytes.
     * Specifically, it returns `x / 2`.
     * @param x
     */
    function decodedLen(x) {
        return Math.floor(x / 2);
    }
    exports_9("decodedLen", decodedLen);
    /**
     * DecodeString returns the bytes represented by the hexadecimal string `s`.
     * DecodeString expects that src contains only hexadecimal characters and that
     * src has even length.
     * If the input is malformed, DecodeString will throws an error.
     * @param s the `string` need to decode to `Uint8Array`
     */
    function decodeString(s) {
        const src = new TextEncoder().encode(s);
        // We can use the source slice itself as the destination
        // because the decode loop increments by one and then the 'seen' byte is not
        // used anymore.
        const [n, err] = decode(src, src);
        if (err) {
            throw err;
        }
        return src.slice(0, n);
    }
    exports_9("decodeString", decodeString);
    return {
        setters: [],
        execute: function () {
            hextable = new TextEncoder().encode("0123456789abcdef");
        }
    };
});
System.register("file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/validate", ["file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/create", "file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/base64/base64url", "https://deno.land/std@v0.60.0/encoding/hex"], function (exports_10, context_10) {
    "use strict";
    var create_ts_1, base64url_ts_3, hex_ts_2, JwtError;
    var __moduleName = context_10 && context_10.id;
    function isObject(obj) {
        return (obj !== null && typeof obj === "object" && Array.isArray(obj) === false);
    }
    function has(key, x) {
        return key in x;
    }
    function isExpired(exp, leeway = 0) {
        return new Date(exp + leeway) < new Date();
    }
    exports_10("isExpired", isExpired);
    // A present 'crit' header parameter indicates that the JWS signature validator
    // must understand and process additional claims (JWS §4.1.11)
    function checkHeaderCrit(header, handlers) {
        // prettier-ignore
        const reservedWords = new Set([
            "alg",
            "jku",
            "jwk",
            "kid",
            "x5u",
            "x5c",
            "x5t",
            "x5t#S256",
            "typ",
            "cty",
            "crit",
            "enc",
            "zip",
            "epk",
            "apu",
            "apv",
            "iv",
            "tag",
            "p2s",
            "p2c",
        ]);
        if (!Array.isArray(header.crit) ||
            header.crit.some((str) => typeof str !== "string" || !str)) {
            throw Error("header parameter 'crit' must be an array of non-empty strings");
        }
        if (header.crit.some((str) => reservedWords.has(str))) {
            throw Error("the 'crit' list contains a non-extension header parameter");
        }
        if (header.crit.some((str) => typeof header[str] === "undefined" ||
            typeof handlers?.[str] !== "function")) {
            throw Error("critical extension header parameters are not understood");
        }
        return Promise.all(header.crit.map((str) => handlers[str](header[str])));
    }
    exports_10("checkHeaderCrit", checkHeaderCrit);
    function validateJwtObject(maybeJwtObject) {
        if (typeof maybeJwtObject.signature !== "string") {
            throw ReferenceError("the signature is no string");
        }
        if (!(isObject(maybeJwtObject.header) &&
            has("alg", maybeJwtObject.header) &&
            typeof maybeJwtObject.header.alg === "string")) {
            throw ReferenceError("header parameter 'alg' is not a string");
        }
        if (isObject(maybeJwtObject.payload) && has("exp", maybeJwtObject.payload)) {
            if (typeof maybeJwtObject.payload.exp !== "number") {
                throw RangeError("claim 'exp' is not a number");
            } // Implementers MAY provide for some small leeway to account for clock skew (JWT §4.1.4)
            else if (isExpired(maybeJwtObject.payload.exp, 1000)) {
                throw RangeError("the jwt is expired");
            }
        }
        return maybeJwtObject;
    }
    exports_10("validateJwtObject", validateJwtObject);
    async function handleJwtObject(jwtObject, critHandlers) {
        return [
            jwtObject,
            "crit" in jwtObject.header
                ? await checkHeaderCrit(jwtObject.header, critHandlers)
                : undefined,
        ];
    }
    function parseAndDecode(jwt) {
        const parsedArray = jwt
            .split(".")
            .map(base64url_ts_3.convertBase64urlToUint8Array)
            .map((uint8Array, index) => index === 2
            ? hex_ts_2.encodeToString(uint8Array)
            : JSON.parse(new TextDecoder().decode(uint8Array)));
        if (parsedArray.length !== 3)
            throw TypeError("invalid serialization");
        return {
            header: parsedArray[0],
            payload: parsedArray[1] === "" ? undefined : parsedArray[1],
            signature: parsedArray[2],
        };
    }
    exports_10("parseAndDecode", parseAndDecode);
    async function validateJwt(jwt, key, { critHandlers } = {}) {
        try {
            const [oldJwtObject, critResult] = await handleJwtObject(validateJwtObject(parseAndDecode(jwt)), critHandlers);
            if (oldJwtObject.signature !==
                parseAndDecode(create_ts_1.makeJwt({ ...oldJwtObject, key })).signature) {
                throw Error("signatures don't match");
            }
            return { ...oldJwtObject, jwt, critResult, isValid: true };
        }
        catch (err) {
            return {
                jwt,
                error: new JwtError(err.message),
                isValid: false,
                isExpired: err.message === "the jwt is expired" ? true : false,
            };
        }
    }
    exports_10("validateJwt", validateJwt);
    return {
        setters: [
            function (create_ts_1_1) {
                create_ts_1 = create_ts_1_1;
            },
            function (base64url_ts_3_1) {
                base64url_ts_3 = base64url_ts_3_1;
            },
            function (hex_ts_2_1) {
                hex_ts_2 = hex_ts_2_1;
            }
        ],
        execute: function () {
            JwtError = class JwtError extends Error {
                constructor(message) {
                    super(message);
                    this.message = message;
                    this.name = this.constructor.name;
                    this.date = new Date();
                }
            };
        }
    };
});

const __exp = __instantiate("file:///Users/agalushka/go/src/gitlab.ecsvc.net/edgecompute/djwt/validate", false);
export const validateJwt = __exp["validateJwt"];
export const validateJwtObject = __exp["validateJwtObject"];
export const checkHeaderCrit = __exp["checkHeaderCrit"];
export const parseAndDecode = __exp["parseAndDecode"];
export const isExpired = __exp["isExpired"];
export const Jose = __exp["Jose"];
export const Payload = __exp["Payload"];
export const Handlers = __exp["Handlers"];
export const JwtObject = __exp["JwtObject"];
export const JwtValidation = __exp["JwtValidation"];
export const Opts = __exp["Opts"];
