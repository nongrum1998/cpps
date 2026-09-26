/**
 * @file Tests for the Fernet request-payload encryption helpers.
 *
 * These helpers encrypt every outbound API body, so a failure to obtain a
 * cryptographically secure random number breaks all authenticated requests —
 * most visibly login, which is the first call that needs an IV.
 *
 * The interesting cases run against a *simulated native runtime* because the
 * Jest environment ships Node's WebCrypto, which always provides a working
 * `globalThis.crypto.getRandomValues` and would mask a regression back to that
 * source. See `describe('secure random source')` below.
 */

const FERNET_KEY = '29fuUgagIGhDtyGqzrg1r39nKeWfGEobhXWwkaXMlTo=';

const IV_BYTE_LENGTH = 16;

type EncryptionModule = typeof import('@lib/encryption');

/**
 * Counts up one byte at a time so every call yields distinct IV bytes.
 *
 * Deterministic on purpose: it makes "a fresh IV per call" and "the token IV
 * is exactly what expo-crypto returned" assertions exact, instead of relying
 * on random bytes happening to differ.
 */
let byteCounter = 0;

const mockGetRandomBytesAsync = jest.fn(async (byteCount: number): Promise<Uint8Array> => {
  const bytes = new Uint8Array(byteCount);

  for (let i = 0; i < byteCount; i += 1) {
    byteCounter = (byteCounter + 1) & 0xff;
    bytes[i] = byteCounter;
  }

  return bytes;
});

const mockGetRandomValues = jest.fn((array: Uint8Array): Uint8Array => array);

/**
 * Stands in for the `expo-crypto` native module.
 *
 * The real package resolves `requireNativeModule('ExpoCrypto')` at import
 * time, which throws under Jest because no native runtime is present.
 */
jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn(),
  getRandomBytesAsync: mockGetRandomBytesAsync,
  getRandomValues: mockGetRandomValues,
}));

/**
 * Loads a fresh copy of the encryption barrel.
 *
 * `encryption.ts` reads `process.env.EXPO_PUBLIC_FERNET_KEY` into a
 * module-scope constant, so the module must be required *after* the key is
 * arranged, and it must be a fresh instance per test — hence
 * `jest.isolateModules` rather than a static import.
 */
function loadEncryption(): EncryptionModule {
  let loaded: EncryptionModule | undefined;

  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    loaded = require('@lib/encryption') as EncryptionModule;
  });

  if (!loaded) {
    throw new Error('Failed to load the encryption module');
  }

  return loaded;
}

/**
 * Decodes a urlsafe-base64 Fernet token into its raw bytes.
 *
 * `Buffer` is avoided deliberately: the project ships no Node type
 * definitions, so it is not available in tests. The DOM `atob` is, and both
 * React Native and Node provide it at runtime.
 */
function tokenToBytes(token: string): number[] {
  let base64 = token.replace(/-/g, '+').replace(/_/g, '/');

  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  return Array.from(atob(base64), (char) => char.charCodeAt(0));
}

type MutableCryptoGlobal = { getRandomValues?: unknown };

/**
 * Reproduces the React Native 0.86 runtime as the app actually runs it.
 *
 * React Native provides no `getRandomValues` of its own, so the property is
 * masked to `undefined` to match. Encryption must still succeed, because it
 * must not read this global at all.
 */
function simulateNativeRuntime(): () => void {
  const runtime = globalThis as unknown as { crypto: MutableCryptoGlobal };

  const hadOwnGetRandomValues = Object.prototype.hasOwnProperty.call(
    runtime.crypto,
    'getRandomValues'
  );
  const previousOwn = runtime.crypto.getRandomValues;

  Object.defineProperty(runtime.crypto, 'getRandomValues', {
    value: undefined,
    configurable: true,
    writable: true,
  });

  return () => {
    if (hadOwnGetRandomValues) {
      runtime.crypto.getRandomValues = previousOwn;
    } else {
      delete runtime.crypto.getRandomValues;
    }
  };
}

describe('secure random source', () => {
  const originalKey = process.env.EXPO_PUBLIC_FERNET_KEY;

  let restoreRuntime: () => void;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_FERNET_KEY = FERNET_KEY;
    restoreRuntime = simulateNativeRuntime();
    mockGetRandomBytesAsync.mockClear();
    mockGetRandomValues.mockClear();
  });

  afterEach(() => {
    restoreRuntime();

    if (originalKey === undefined) {
      delete process.env.EXPO_PUBLIC_FERNET_KEY;
    } else {
      process.env.EXPO_PUBLIC_FERNET_KEY = originalKey;
    }
  });

  it('draws the IV from expo-crypto', async () => {
    const { encryptText } = loadEncryption();

    await encryptText('{"username":"pensioner"}');

    expect(mockGetRandomBytesAsync).toHaveBeenCalledWith(IV_BYTE_LENGTH);
  });

  it('never falls back to the host RNG', async () => {
    const { encryptText } = loadEncryption();

    await encryptText('payload');

    expect(mockGetRandomValues).not.toHaveBeenCalled();
  });

  it('does not install a global polyfill to satisfy crypto-js', async () => {
    const { encryptText } = loadEncryption();

    await encryptText('payload');

    // The runtime still has no RNG afterwards, which proves the IV never came
    // from `globalThis.crypto` and that we are not quietly masking the problem.
    expect(globalThis.crypto.getRandomValues).toBeUndefined();
  });

  it('encrypts without throwing when no host RNG exists', async () => {
    const { encryptText } = loadEncryption();

    await expect(encryptText('{"username":"pensioner"}')).resolves.toEqual(expect.any(String));
  });

  it('round-trips a payload through encrypt and decrypt', async () => {
    const { decryptText, encryptText } = loadEncryption();
    const plain = '{"username":"pensioner","password":"secret"}';

    expect(decryptText(await encryptText(plain))).toBe(plain);
  });
});

describe('encryptText', () => {
  const originalKey = process.env.EXPO_PUBLIC_FERNET_KEY;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_FERNET_KEY = FERNET_KEY;
    mockGetRandomBytesAsync.mockClear();
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.EXPO_PUBLIC_FERNET_KEY;
    } else {
      process.env.EXPO_PUBLIC_FERNET_KEY = originalKey;
    }
  });

  it('returns a promise', () => {
    const { encryptText } = loadEncryption();

    expect(encryptText('payload')).toBeInstanceOf(Promise);
  });

  it('rejects with a clear error when the Fernet key is absent', async () => {
    delete process.env.EXPO_PUBLIC_FERNET_KEY;

    const { encryptText } = loadEncryption();

    await expect(encryptText('payload')).rejects.toThrow('Fernet key missing');
  });

  it('writes the random bytes into the token IV in the same order', async () => {
    const { encryptText } = loadEncryption();

    const token = await encryptText('payload');
    const [{ value }] = mockGetRandomBytesAsync.mock.results;
    const bytes = await value;

    // Fernet layout: 0x80 version byte, 8-byte timestamp, then the 16-byte IV.
    const tokenIv = tokenToBytes(token).slice(9, 25);

    expect(Array.from(tokenIv)).toEqual(Array.from(bytes));
  });

  it('produces a fresh IV per call rather than reusing one', async () => {
    const { encryptText } = loadEncryption();

    const tokens = new Set(
      await Promise.all(Array.from({ length: 8 }, () => encryptText('same plaintext')))
    );

    expect(tokens.size).toBe(8);
  });

  it('emits urlsafe base64 so the token survives URL and header transport', async () => {
    const { encryptText } = loadEncryption();

    // Checked across many tokens because the `+`/`/` characters this guards
    // against only appear in roughly one token in four.
    const tokens = await Promise.all(Array.from({ length: 32 }, () => encryptText('payload')));

    for (const token of tokens) {
      expect(token).not.toMatch(/[+/]/);
    }
  });

  it('prefixes the Fernet version byte 0x80', async () => {
    const { encryptText } = loadEncryption();

    // A leading 0x80 version byte always base64-encodes to "g", so every
    // spec-compliant Fernet token starts with it.
    const tokens = await Promise.all(Array.from({ length: 8 }, () => encryptText('payload')));

    for (const token of tokens) {
      expect(token.startsWith('g')).toBe(true);
    }
  });
});

describe('decryptText', () => {
  const originalKey = process.env.EXPO_PUBLIC_FERNET_KEY;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_FERNET_KEY = FERNET_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.EXPO_PUBLIC_FERNET_KEY;
    } else {
      process.env.EXPO_PUBLIC_FERNET_KEY = originalKey;
    }
  });

  it('rejects a token whose payload was tampered with', async () => {
    const { decryptText, encryptText } = loadEncryption();
    const token = await encryptText('payload');
    const flipped = token.slice(0, 40) + (token[40] === 'A' ? 'B' : 'A') + token.slice(41);

    expect(() => decryptText(flipped)).toThrow(/HMAC verification failed/);
  });

  it('rejects a token that is too short to be valid', () => {
    const { decryptText } = loadEncryption();

    expect(() => decryptText('c2hvcnQ')).toThrow(/Invalid Fernet token length/);
  });

  it('rejects a token encrypted with a different key', async () => {
    const { encryptText } = loadEncryption();
    const foreign = await encryptText('payload');

    process.env.EXPO_PUBLIC_FERNET_KEY = 'qL8dw3AQ5fnGR2vJ7NmXpK1sYt6bUe0cVh4Zr9iO0pXk=';
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fresh = require('@lib/encryption') as EncryptionModule;

      expect(() => fresh.decryptText(foreign)).toThrow(/HMAC verification failed/);
    });
  });
});
