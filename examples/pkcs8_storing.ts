import { base64 } from "./deps.ts";

/*
  Import a PEM encoded RSA private key, to use for RSA-PSS signing.
  Takes a string containing the PEM encoded key, and returns a Promise
  that will resolve to a CryptoKey representing the private key.
  */
function importPrivateKey(pem: string) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length,
  );
  const binaryDer = base64.decode(pemContents).buffer;
  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-384",
    },
    true,
    ["sign"],
  );
}

async function generatePemFromPrivateCryptoKey(privateKey: CryptoKey) {
  const exportedKey = await crypto.subtle.exportKey("pkcs8", privateKey);
  const exportedAsBase64 = base64.encode(exportedKey);
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
}

const keyRS384CryptoKeyPair = await window.crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-384",
  },
  true,
  ["verify", "sign"],
);

const { privateKey } = keyRS384CryptoKeyPair;

const pemExported = await generatePemFromPrivateCryptoKey(privateKey);

const importedCryptoKey = await importPrivateKey(pemExported);

const areEqualKeys =
  pemExported === await generatePemFromPrivateCryptoKey(importedCryptoKey);

console.log(areEqualKeys);
