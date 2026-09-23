// Encrypts a request body and wraps it as { "payload": "<fernet token>" }.
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
 * Encrypts a plaintext string into a Fernet token.
 * @param {string} plainText UTF-8 plaintext.
 * @param {string} fernetKey base64 32-byte Fernet key.
 * @returns {string} URL-safe base64 Fernet token.
 * @throws {TypeError} When plainText is not a string.
 * @throws {Error} On invalid key length.
 */
function encryptText(plainText, fernetKey) {
  if (typeof plainText !== 'string') {
    throw new TypeError(`encryptText expected string plaintext, got ${typeof plainText}`);
  }

  const { signingKey, encryptionKey } = splitFernetKey(fernetKey);

  const version = Buffer.from([0x80]);
  const timestamp = Buffer.alloc(8);
  timestamp.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000)));

  const iv = nodeCrypto.randomBytes(16);
  const cipher = nodeCrypto.createCipheriv('aes-128-cbc', encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);

  const payload = Buffer.concat([version, timestamp, iv, ciphertext]);
  const hmac = nodeCrypto.createHmac('sha256', signingKey).update(payload).digest();

  return urlSafeB64(Buffer.concat([payload, hmac]));
}

const key = request.environment.get('FERNET_KEY');

if (!key) {
  throw new Error('FERNET_KEY is missing');
}

// Kulala exposes request.body as a read-only accessor object
// ({ getRaw, tryGetSubstituted, getComputed }); the JetBrains HTTP client
// exposes the raw body string. Read whichever shape is present.
const body =
  typeof request.body === 'object' && typeof request.body.getComputed === 'function'
    ? request.body.getComputed() || request.body.tryGetSubstituted() || request.body.getRaw()
    : request.body;

const payload = typeof body === 'string' ? body : JSON.stringify(body || {});

const encrypted = encryptText(payload, key);

if (typeof encrypted !== 'string') {
  throw new Error('encryptText() did not return a string');
}

// JetBrains HTTP client: mutating request.body replaces the outgoing body.
// Kulala.nvim pre-request scripts cannot mutate the request body; to encrypt
// under Kulala, pre-compute the token into a request variable and reference it
// from the body instead:
//   request.variables.set('ENC_PAYLOAD', encrypted);
//   body: { "payload": "{{ENC_PAYLOAD}}" }
request.body = JSON.stringify({ payload: encrypted });

client.log('BODY =>', request.body);
