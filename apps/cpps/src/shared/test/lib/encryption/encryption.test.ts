/**
 * @file Tests for the Fernet request-payload encryption helpers.
 *
 * These helpers encrypt every outbound API body, so a failure to obtain a
 * cryptographically secure random number breaks all authenticated requests —
 * most visibly login, which is the first call that needs an IV.
 *
 * The interesting cases run against a *simulated native runtime* because the
 * Jest environment ships Node's WebCrypto, which always provides a working
 * `globalThis.crypto.getRandomValues` and therefore masks the production
 * failure entirely. See `describe('secure random source')` below.
 */

const FERNET_KEY = '29fuUgagIGhDtyGqzrg1r39nKeWfGEobhXWwkaXMlTo=';

type EncryptionModule = typeof import('@lib/encryption');

/**
 * Stands in for the `expo-crypto` native module.
 *
 * The real package resolves `requireNativeModule('ExpoCrypto')` at import
 * time, which throws under Jest because no native runtime is present. This
 * mock instead publishes the same shape onto the `global.expo.modules` proxy
 * that `react-native-get-random-values` probes for, including the synchronous
 * `getRandomValues` signature the polyfill calls.
 */
jest.mock('expo-crypto', () => {
  const getRandomValues = (array: Uint8Array): Uint8Array => {
    for (let i = 0; i < array.length; i += 1) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  };

  const expoGlobal = globalThis as unknown as {
    expo: { modules: Record<string, unknown> };
  };

  expoGlobal.expo.modules.ExpoCrypto = { getRandomValues };

  return {
    getRandomValues,
    getRandomBytes: jest.fn(),
    getRandomBytesAsync: jest.fn(),
  };
});

/**
 * Loads a fresh copy of the encryption barrel.
 *
 * `encryption.ts` reads `process.env.EXPO_PUBLIC_FERNET_KEY` into a
 * module-scope constant, and `crypto-js` captures its reference to
 * `globalThis.crypto` at import time. Both mean the module must be required
 * *after* the relevant global state is arranged, and it must be a fresh
 * instance — hence `jest.isolateModules` rather than a static import.
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

type MutableCryptoGlobal = { getRandomValues?: unknown };

/**
 * Reproduces the React Native 0.86 runtime as the app actually runs it.
 *
 * React Native provides no `getRandomValues` of its own, so the property is
 * masked to `undefined` to match. `RN$Bridgeless` is also set because
 * `react-native-get-random-values` treats a bridgeless runtime as
 * non-debuggable; without it the polyfill silently degrades to `Math.random()`
 * and the missing native module never surfaces as an error.
 */
function simulateNativeRuntime(): () => void {
  const runtime = globalThis as unknown as {
    RN$Bridgeless?: boolean;
    crypto: MutableCryptoGlobal;
  };

  const hadOwnGetRandomValues = Object.prototype.hasOwnProperty.call(
    runtime.crypto,
    'getRandomValues'
  );
  const previousOwn = runtime.crypto.getRandomValues;
  const previousBridgeless = runtime.RN$Bridgeless;

  Object.defineProperty(runtime.crypto, 'getRandomValues', {
    value: undefined,
    configurable: true,
    writable: true,
  });
  runtime.RN$Bridgeless = true;

  return () => {
    if (hadOwnGetRandomValues) {
      runtime.crypto.getRandomValues = previousOwn;
    } else {
      delete runtime.crypto.getRandomValues;
    }

    if (previousBridgeless === undefined) {
      delete runtime.RN$Bridgeless;
    } else {
      runtime.RN$Bridgeless = previousBridgeless;
    }
  };
}

describe('secure random source', () => {
  const originalKey = process.env.EXPO_PUBLIC_FERNET_KEY;

  let restoreRuntime: () => void;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_FERNET_KEY = FERNET_KEY;
    restoreRuntime = simulateNativeRuntime();
  });

  afterEach(() => {
    restoreRuntime();

    if (originalKey === undefined) {
      delete process.env.EXPO_PUBLIC_FERNET_KEY;
    } else {
      process.env.EXPO_PUBLIC_FERNET_KEY = originalKey;
    }
  });

  it('installs a working getRandomValues on a runtime that lacks one', () => {
    loadEncryption();

    expect(typeof globalThis.crypto.getRandomValues).toBe('function');
  });

  it('encrypts without throwing when no host RNG exists', () => {
    const { encryptText } = loadEncryption();

    // crypto-js reports a missing RNG as
    // "Native crypto module could not be used to get secure random number."
    expect(() => encryptText('{"username":"pensioner"}')).not.toThrow();
  });

  it('round-trips a payload through encrypt and decrypt', () => {
    const { decryptText, encryptText } = loadEncryption();
    const plain = '{"username":"pensioner","password":"secret"}';

    expect(decryptText(encryptText(plain))).toBe(plain);
  });
});

describe('encryptText', () => {
  const originalKey = process.env.EXPO_PUBLIC_FERNET_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.EXPO_PUBLIC_FERNET_KEY;
    } else {
      process.env.EXPO_PUBLIC_FERNET_KEY = originalKey;
    }
  });

  it('throws a clear error when the Fernet key is absent', () => {
    delete process.env.EXPO_PUBLIC_FERNET_KEY;

    const { encryptText } = loadEncryption();

    expect(() => encryptText('payload')).toThrow('Fernet key missing');
  });

  it('produces a fresh IV per call rather than reusing one', () => {
    process.env.EXPO_PUBLIC_FERNET_KEY = FERNET_KEY;

    const { encryptText } = loadEncryption();
    const tokens = new Set(Array.from({ length: 8 }, () => encryptText('same plaintext')));

    expect(tokens.size).toBe(8);
  });

  it('emits urlsafe base64 so the token survives URL and header transport', () => {
    process.env.EXPO_PUBLIC_FERNET_KEY = FERNET_KEY;

    const { encryptText } = loadEncryption();

    // Checked across many tokens because the `+`/`/` characters this guards
    // against only appear in roughly one token in four.
    const tokens = Array.from({ length: 32 }, () => encryptText('payload'));

    for (const token of tokens) {
      expect(token).not.toMatch(/[+/]/);
    }
  });

  it('prefixes the Fernet version byte 0x80', () => {
    process.env.EXPO_PUBLIC_FERNET_KEY = FERNET_KEY;

    const { encryptText } = loadEncryption();
    // A leading 0x80 version byte always base64-encodes to "g", so every
    // spec-compliant Fernet token starts with it.
    const tokens = Array.from({ length: 8 }, () => encryptText('payload'));

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

  it('rejects a token whose payload was tampered with', () => {
    const { decryptText, encryptText } = loadEncryption();
    const token = encryptText('payload');
    const flipped = token.slice(0, 40) + (token[40] === 'A' ? 'B' : 'A') + token.slice(41);

    expect(() => decryptText(flipped)).toThrow(/HMAC verification failed/);
  });

  it('rejects a token that is too short to be valid', () => {
    const { decryptText } = loadEncryption();

    expect(() => decryptText('c2hvcnQ')).toThrow(/Invalid Fernet token length/);
  });

  it('rejects a token encrypted with a different key', () => {
    const { encryptText } = loadEncryption();
    const foreign = encryptText('payload');

    process.env.EXPO_PUBLIC_FERNET_KEY = 'qL8dw3AQ5fnGR2vJ7NmXpK1sYt6bUe0cVh4Zr9iO0pXk=';
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fresh = require('@lib/encryption') as EncryptionModule;

      expect(() => fresh.decryptText(foreign)).toThrow(/HMAC verification failed/);
    });
  });
});
