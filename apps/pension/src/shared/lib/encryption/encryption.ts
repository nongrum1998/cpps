import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

const FERNET_KEY = process.env.EXPO_PUBLIC_FERNET_KEY || '';

function base64ToUrlSafe(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_');
}

function urlSafeToBase64(base64: string): string {
  let result = base64.replace(/-/g, '+').replace(/_/g, '/');

  while (result.length % 4 !== 0) {
    result += '=';
  }

  return result;
}

function getFernetKeys(keyBase64: string) {
  const rawKey = CryptoJS.enc.Base64.parse(urlSafeToBase64(keyBase64));

  return {
    signingKey: CryptoJS.lib.WordArray.create(rawKey.words.slice(0, 4), 16),

    encryptionKey: CryptoJS.lib.WordArray.create(rawKey.words.slice(4, 8), 16),
  };
}

export function encryptText(plainText: string): string {
  if (!FERNET_KEY) {
    throw new Error('Fernet key missing');
  }

  const { signingKey, encryptionKey } = getFernetKeys(FERNET_KEY);

  const versionHex = '80';

  const timestampHex = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(16, '0');

  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plainText, encryptionKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const payloadHex =
    versionHex +
    timestampHex +
    iv.toString(CryptoJS.enc.Hex) +
    encrypted.ciphertext.toString(CryptoJS.enc.Hex);

  const payload = CryptoJS.enc.Hex.parse(payloadHex);

  const hmac = CryptoJS.HmacSHA256(payload, signingKey);

  const token = payload.clone().concat(hmac);

  return base64ToUrlSafe(token.toString(CryptoJS.enc.Base64));
}

export function decryptText(encryptedText: string): string {
  if (!FERNET_KEY) {
    throw new Error('Fernet key missing');
  }

  const { signingKey, encryptionKey } = getFernetKeys(FERNET_KEY);

  const tokenBytes = CryptoJS.enc.Base64.parse(urlSafeToBase64(encryptedText));

  const tokenHex = tokenBytes.toString(CryptoJS.enc.Hex);

  if (tokenHex.length < 146) {
    throw new Error('Invalid Fernet token length');
  }

  const payloadHexLength = tokenHex.length - 64;

  const payloadHex = tokenHex.substring(0, payloadHexLength);

  const expectedHmacHex = tokenHex.substring(payloadHexLength);

  const calculatedHmacHex = CryptoJS.HmacSHA256(
    CryptoJS.enc.Hex.parse(payloadHex),
    signingKey
  ).toString(CryptoJS.enc.Hex);

  if (calculatedHmacHex.toLowerCase() !== expectedHmacHex.toLowerCase()) {
    throw new Error('Fernet HMAC verification failed: invalid key or tampered payload');
  }

  const version = tokenHex.substring(0, 2);

  if (version !== '80') {
    throw new Error(`Invalid Fernet version: ${version}`);
  }

  const ivHex = tokenHex.substring(18, 50);

  const ciphertextHex = tokenHex.substring(50, payloadHexLength);

  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertextHex),
    }),
    encryptionKey,
    {
      iv: CryptoJS.enc.Hex.parse(ivHex),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const result = decrypted.toString(CryptoJS.enc.Utf8);

  if (!result) {
    throw new Error('Fernet decryption failed');
  }

  return result;
}

export const sha256 = (value: string): string => {
  return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
};
