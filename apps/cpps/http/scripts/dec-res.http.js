// Decrypts the `data` field of a JSON response body.
//
// Fernet wire format mirrors src/shared/lib/encryption/encryption.ts exactly:
//   token = 0x80 | timestamp(8) | iv(16) | AES-128-CBC/PKCS7 ciphertext |
//           HMAC-SHA256(payload, signingKey)
//   key   = base64 of 32 bytes; first 16 = signing key, last 16 = AES key
//   token is URL-safe base64.
//
// IMPORTANT (Kulala.nvim): this file must stay fully self-contained. Kulala
// executes scripts by appending them to a temp CJS bundle, so relative
// requires (./crypto) and npm lookups (crypto-js) fail with MODULE_NOT_FOUND.
// Only Node built-ins are safe here.
'use strict';

const nodeCrypto = require('crypto');

/** Encodes a Buffer as URL-safe base64 (same output as the shared lib). */
function urlSafeB64(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Decodes URL-safe base64 (padding optional) into a Buffer. */
function b64ToBuf(value) {
  return Buffer.from(String(value).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

/** Splits a base64 Fernet key into its 16-byte signing and encryption halves. */
function splitFernetKey(keyBase64) {
  const raw = b64ToBuf(keyBase64);

  if (raw.length !== 32) {
    throw new Error(`Invalid Fernet key length: expected 32 bytes, got ${raw.length}`);
  }

  return {
    signingKey: raw.subarray(0, 16),
    encryptionKey: raw.subarray(16, 32),
  };
}

/**
 * Decrypts a Fernet token.
 * @param {string} encryptedText URL-safe base64 Fernet token.
 * @param {string} fernetKey base64 32-byte Fernet key.
 * @returns {string} UTF-8 plaintext.
 * @throws {Error} On invalid key length, token shape, HMAC, or padding.
 */
function decryptText(encryptedText, fernetKey) {
  if (typeof encryptedText !== 'string') {
    throw new TypeError(
      `decryptText expected encrypted string, got ${typeof encryptedText}: ${JSON.stringify(encryptedText)}`
    );
  }

  const { signingKey, encryptionKey } = splitFernetKey(fernetKey);

  const token = b64ToBuf(encryptedText);

  if (token.length < 73) {
    // 1 (version) + 8 (timestamp) + 16 (iv) + 16 (min ciphertext) + 32 (hmac)
    throw new Error('Invalid Fernet token length');
  }

  if (token[0] !== 0x80) {
    throw new Error(`Invalid Fernet version: 0x${token[0].toString(16)}`);
  }

  const payload = token.subarray(0, token.length - 32);
  const expectedHmac = token.subarray(token.length - 32);
  const calculatedHmac = nodeCrypto.createHmac('sha256', signingKey).update(payload).digest();

  if (!nodeCrypto.timingSafeEqual(calculatedHmac, expectedHmac)) {
    throw new Error('Fernet HMAC verification failed: invalid key or tampered payload');
  }

  const iv = token.subarray(9, 25);
  const ciphertext = token.subarray(25, token.length - 32);

  let decrypted;

  try {
    const decipher = nodeCrypto.createDecipheriv('aes-128-cbc', encryptionKey, iv);
    decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error('Fernet decryption failed');
  }

  const result = decrypted.toString('utf8');

  if (!result) {
    throw new Error('Fernet decryption failed');
  }

  return result;
}

const encrypted = response.body && response.body.data;

if (!encrypted) {
  return;
}

const key = request.environment.get('FERNET_KEY');

if (!key) {
  throw new Error('FERNET_KEY is missing');
}

const normalizeData = typeof encrypted === 'string' ? encrypted : JSON.stringify(encrypted);

const decrypted = decryptText(normalizeData, key);

const data = typeof decrypted === 'string' ? JSON.parse(decrypted) : decrypted;

client.log('DEC =>', JSON.stringify(data, null, 2));
