// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const encoder = new TextEncoder();
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
    throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`);
}
const base64abc = [
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
    for(i = 2; i < l; i += 3){
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2 | uint8[i] >> 6];
        result += base64abc[uint8[i] & 0x3f];
    }
    if (i === l + 1) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2];
        result += "=";
    }
    return result;
}
function decodeBase64(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i = 0; i < size; i++){
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}
function addPaddingToBase64url(base64url) {
    if (base64url.length % 4 === 2) return base64url + "==";
    if (base64url.length % 4 === 3) return base64url + "=";
    if (base64url.length % 4 === 1) {
        throw new TypeError("Illegal base64url string!");
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
const encoder1 = new TextEncoder();
const decoder = new TextDecoder();
function isArray(input) {
    return Array.isArray(input);
}
function isDefined(input) {
    return input !== undefined;
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
    return input === undefined;
}
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
    switch(alg){
        case "HS256":
            return {
                hash: {
                    name: "SHA-256"
                },
                name: "HMAC"
            };
        case "HS384":
            return {
                hash: {
                    name: "SHA-384"
                },
                name: "HMAC"
            };
        case "HS512":
            return {
                hash: {
                    name: "SHA-512"
                },
                name: "HMAC"
            };
        case "PS256":
            return {
                hash: {
                    name: "SHA-256"
                },
                name: "RSA-PSS",
                saltLength: 256 >> 3
            };
        case "PS384":
            return {
                hash: {
                    name: "SHA-384"
                },
                name: "RSA-PSS",
                saltLength: 384 >> 3
            };
        case "PS512":
            return {
                hash: {
                    name: "SHA-512"
                },
                name: "RSA-PSS",
                saltLength: 512 >> 3
            };
        case "RS256":
            return {
                hash: {
                    name: "SHA-256"
                },
                name: "RSASSA-PKCS1-v1_5"
            };
        case "RS384":
            return {
                hash: {
                    name: "SHA-384"
                },
                name: "RSASSA-PKCS1-v1_5"
            };
        case "RS512":
            return {
                hash: {
                    name: "SHA-512"
                },
                name: "RSASSA-PKCS1-v1_5"
            };
        case "ES256":
            return {
                hash: {
                    name: "SHA-256"
                },
                name: "ECDSA",
                namedCurve: "P-256"
            };
        case "ES384":
            return {
                hash: {
                    name: "SHA-384"
                },
                name: "ECDSA",
                namedCurve: "P-384"
            };
        default:
            throw new Error(`The jwt's alg '${alg}' is not supported.`);
    }
}
async function verify1(signature, key, alg, signingInput) {
    return isNull(key) ? signature.length === 0 : await crypto.subtle.verify(getAlgorithm(alg), key, signature, encoder1.encode(signingInput));
}
async function create(alg, key, signingInput) {
    return isNull(key) ? "" : encodeBase64Url(new Uint8Array(await crypto.subtle.sign(getAlgorithm(alg), key, encoder1.encode(signingInput))));
}
function isExpired(exp, leeway) {
    return exp + leeway < Date.now() / 1000;
}
function isTooEarly(nbf, leeway) {
    return nbf - leeway > Date.now() / 1000;
}
function is3Tuple(arr) {
    return arr.length === 3;
}
function hasInvalidTimingClaims(...claimValues) {
    return claimValues.some((claimValue)=>isDefined(claimValue) && isNotNumber(claimValue));
}
function validateTimingClaims(payload, { expLeeway = 1, nbfLeeway = 1, ignoreExp, ignoreNbf } = {}) {
    if (hasInvalidTimingClaims(payload.exp, payload.nbf)) {
        throw new Error(`The jwt has an invalid 'exp' or 'nbf' claim.`);
    }
    if (isNumber(payload.exp) && isNotTrue(ignoreExp) && isExpired(payload.exp, expLeeway)) {
        throw RangeError("The jwt is expired.");
    }
    if (isNumber(payload.nbf) && isNotTrue(ignoreNbf) && isTooEarly(payload.nbf, nbfLeeway)) {
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
        const audArray = isString(aud) ? [
            aud
        ] : aud;
        const audienceArrayOrRegex = isString(audience) ? [
            audience
        ] : audience;
        if (!audArray.some((audString)=>isArray(audienceArrayOrRegex) ? audienceArrayOrRegex.includes(audString) : audienceArrayOrRegex.test(audString))) {
            throw new Error("The identification with the value in the 'aud' claim has failed.");
        }
    } else {
        throw new Error(`The jwt has an invalid 'aud' claim.`);
    }
}
function decode(jwt) {
    try {
        const arr = jwt.split(".").map(decodeBase64Url).map((uint8Array, index)=>index === 0 || index === 1 ? JSON.parse(decoder.decode(uint8Array)) : uint8Array);
        if (is3Tuple(arr)) return arr;
        else throw new Error();
    } catch  {
        throw Error("The serialization of the jwt is invalid.");
    }
}
function validate([header, payload, signature], options) {
    if (isNotString(header?.alg)) {
        throw new Error(`The jwt's 'alg' header parameter value must be a string.`);
    }
    if (isObject(payload)) {
        validateTimingClaims(payload, options);
        if (isDefined(options?.audience)) {
            validateAudClaim(payload.aud, options.audience);
        }
        return {
            header,
            payload,
            signature
        };
    } else {
        throw new Error(`The jwt claims set is not a JSON object.`);
    }
}
async function verify2(jwt, key, options) {
    const { header, payload, signature } = validate(decode(jwt), options);
    if (verify(header.alg, key)) {
        if (!await verify1(signature, key, header.alg, jwt.slice(0, jwt.lastIndexOf(".")))) {
            throw new Error("The jwt's signature does not match the verification signature.");
        }
        if (!(options?.predicates || []).every((predicate)=>predicate(payload))) {
            throw new Error("The payload does not satisfy all passed predicates.");
        }
        return payload;
    } else {
        throw new Error(`The jwt's alg '${header.alg}' does not match the key's algorithm.`);
    }
}
function createSigningInput(header, payload) {
    return `${encodeBase64Url(encoder1.encode(JSON.stringify(header)))}.${encodeBase64Url(encoder1.encode(JSON.stringify(payload)))}`;
}
async function create1(header, payload, key) {
    if (isObject(payload)) {
        if (verify(header.alg, key)) {
            const signingInput = createSigningInput(header, payload);
            const signature = await create(header.alg, key, signingInput);
            return `${signingInput}.${signature}`;
        } else {
            throw new Error(`The jwt's alg '${header.alg}' does not match the key's algorithm.`);
        }
    } else {
        throw new Error(`The jwt claims set is not a JSON object.`);
    }
}
function getNumericDate(exp) {
    return Math.round((exp instanceof Date ? exp.getTime() : Date.now() + exp * 1000) / 1000);
}
export { validateTimingClaims as validateTimingClaims };
export { validateAudClaim as validateAudClaim };
export { decode as decode };
export { validate as validate };
export { verify2 as verify };
export { create1 as create };
export { getNumericDate as getNumericDate };

