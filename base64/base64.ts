function convertBase64ToUint8Array(data: string): Uint8Array {
  const binString = atob(data);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// credit: https://gist.github.com/enepomnyaschih/54c437997f8202871278d0fdf68148ca
// deno-fmt-ignore
const base64abc: readonly string[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
];

function convertUint8ArrayToBase64(bytes: Uint8Array): string {
  let result = "",
    i: number,
    l = bytes.length;
  for (i = 2; i < l; i += 3) {
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
    result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
    result += base64abc[bytes[i] & 0x3f];
  }
  if (i === l + 1) {
    // 1 octet yet to write
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[(bytes[i - 2] & 0x03) << 4];
    result += "==";
  }
  if (i === l) {
    // 2 octets yet to write
    result += base64abc[bytes[i - 2] >> 2];
    result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
    result += base64abc[(bytes[i - 1] & 0x0f) << 2];
    result += "=";
  }
  return result;
}

// ucs-2 string to base64 encoded ascii
function convertStringToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// base64 encoded ascii to ucs-2 string
function convertBase64ToString(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

export {
  convertBase64ToString,
  convertBase64ToUint8Array,
  convertStringToBase64,
  convertUint8ArrayToBase64,
};
