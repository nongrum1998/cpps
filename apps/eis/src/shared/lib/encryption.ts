import { env } from '@utils/env';
import CryptoJS from 'crypto-js';

const appSk = env.EXPO_PUBLIC_APP_SK ?? '';
const appIv = env.EXPO_PUBLIC_APP_IV ?? '';

/**
 * Module-level cache for the derived AES key and IV.
 *
 * The key and IV are derived from static environment variables
 * (`EXPO_PUBLIC_APP_SK` and `EXPO_PUBLIC_APP_IV`) via SHA256. Since these
 * values never change during the app lifecycle, computing the hashes once
 * and reusing them eliminates 6 redundant SHA256 calls per login flow.
 */
let cachedKey: CryptoJS.lib.WordArray | null = null;
let cachedIv: CryptoJS.lib.WordArray | null = null;

const getKeyAndIv = () => {
  if (cachedKey && cachedIv) {
    return { key: cachedKey, iv: cachedIv };
  }

  if (!appSk || !appIv) {
    throw new Error('Missing environment variables');
  }

  const keyHash = CryptoJS.SHA256(appSk).toString();
  const ivHash = CryptoJS.SHA256(appIv).toString();

  cachedKey = CryptoJS.enc.Utf8.parse(keyHash.substring(0, 32));
  cachedIv = CryptoJS.enc.Utf8.parse(ivHash.substring(0, 16));

  return { key: cachedKey, iv: cachedIv };
};

export function encrypt(plain: string): string {
  const { key, iv } = getKeyAndIv();

  const encrypted = CryptoJS.AES.encrypt(plain, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // openssl_encrypt() output
  const opensslOutput = encrypted.toString();

  // PHP does: base64_encode(openssl_encrypt(...))
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(opensslOutput));
}

export function decrypt<T>(cipherText: string): T {
  if (!cipherText) {
    throw new Error('Missing cipher text');
  }

  const { key, iv } = getKeyAndIv();

  const opensslOutput = CryptoJS.enc.Base64.parse(cipherText).toString(CryptoJS.enc.Utf8);

  const decrypted = CryptoJS.AES.decrypt(opensslOutput, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T;
}
