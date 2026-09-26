// `expo-crypto` must be imported before `react-native-get-random-values`.
// It registers the `ExpoCrypto` native module, which the polyfill delegates
// to in order to expose `global.crypto.getRandomValues`. React Native 0.86
// ships no RNG of its own, so without it `CryptoJS.lib.WordArray.random()`
// throws and every encrypted request — including login — fails.
import 'expo-crypto';
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

/**
 * Encrypts a plaintext string into a Fernet token.
 *
 * The token is laid out per the Fernet spec: version byte `0x80`, an 8-byte
 * timestamp, a random 16-byte IV, the AES-128-CBC ciphertext, then an
 * HMAC-SHA256 over everything preceding it.
 *
 * The IV is drawn from `CryptoJS.lib.WordArray.random`, which needs a
 * cryptographically secure `global.crypto.getRandomValues`. React Native
 * provides none on its own, so the module imports `expo-crypto` for this to
 * succeed — see the note at the top of this file.
 *
 * @param plainText - Value to encrypt, usually a JSON-stringified body.
 * @returns The token encoded as urlsafe base64.
 * @throws {Error} `Fernet key missing` when `EXPO_PUBLIC_FERNET_KEY` is unset.
 * @throws {Error} When no secure random source is available; crypto-js raises
 *   "Native crypto module could not be used to get secure random number."
 *
 * @example
 * ```ts
 * const token = encryptText(JSON.stringify({ username, password }));
 * ```
 */
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

/**
 * Decrypts a Fernet token produced by {@link encryptText}.
 *
 * The HMAC is verified before any decryption is attempted, so a tampered
 * token or an incorrect key fails loudly instead of yielding garbage.
 *
 * @param encryptedText - Fernet token encoded as urlsafe base64.
 * @returns The original plaintext.
 * @throws {Error} `Fernet key missing` when `EXPO_PUBLIC_FERNET_KEY` is unset.
 * @throws {Error} `Invalid Fernet token length` when the token is too short to
 *   hold a payload plus HMAC.
 * @throws {Error} `Fernet HMAC verification failed: ...` when the token was
 *   tampered with or the key is wrong.
 * @throws {Error} `Invalid Fernet version: ...` when the leading version byte
 *   is not `0x80`.
 * @throws {Error} `Fernet decryption failed` when the ciphertext does not
 *   decode to valid UTF-8.
 */
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

/**
 * Hashes a string with SHA-256 and returns the digest as lowercase hex.
 *
 * @param value - Value to hash.
 * @returns A 64-character hex digest.
 */
export const sha256 = (value: string): string => {
  return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
};
