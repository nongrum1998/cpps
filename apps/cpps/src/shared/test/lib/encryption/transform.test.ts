/**
 * @file Tests for the recursive field transformer that encrypts request
 * bodies.
 *
 * `encryptText` became asynchronous when the IV moved off the global RNG, so
 * the recursive walk over strings, arrays and objects became asynchronous too.
 * `decryptText` stayed synchronous, which is why both walkers are covered here
 * — the sync one is pinned deliberately so it is not "fixed" by accident.
 */

import {
  decryptFields,
  encryptFields,
} from '../@pension/lib/transform';
import {
  decryptText,
  encryptText,
} from '../@pension/lib/encryption';

const mockEncryptText = encryptText as jest.Mock;
const mockDecryptText = decryptText as jest.Mock;

// `transform.ts` imports `./encryption`, which is the same file the
// `@lib/encryption/encryption` alias resolves to — not the barrel.
jest.mock('@lib/encryption/encryption', () => ({
  encryptText: jest.fn(async (value: string) => `enc(${value})`),
  decryptText: jest.fn((value: string) => value.replace(/^enc\((.*)\)$/, '$1')),
}));

beforeEach(() => jest.clearAllMocks());

describe('encryptFields', () => {
  it('returns a promise', () => {
    expect(encryptFields('solo')).toBeInstanceOf(Promise);
  });

  it('encrypts a bare string', async () => {
    await expect(encryptFields('solo')).resolves.toBe('enc(solo)');
  });

  it('encrypts strings nested through objects and arrays', async () => {
    const input = {
      username: 'pensioner',
      meta: { ppo: '12345', tags: ['a', 'b'] },
      items: [{ deep: 'value' }],
    };

    await expect(encryptFields(input)).resolves.toEqual({
      username: 'enc(pensioner)',
      meta: { ppo: 'enc(12345)', tags: ['enc(a)', 'enc(b)'] },
      items: [{ deep: 'enc(value)' }],
    });
  });

  it('leaves non-string leaves untouched', async () => {
    const input = { count: 7, active: true, missing: null, absent: undefined };

    await expect(encryptFields(input)).resolves.toEqual({
      count: 7,
      active: true,
      missing: null,
      absent: undefined,
    });
  });

  it('does not mutate the input object', async () => {
    const input = { username: 'pensioner' };

    await encryptFields(input);

    expect(input.username).toBe('pensioner');
  });

  it('surfaces a rejected encrypt as a rejected promise', async () => {
    mockEncryptText.mockRejectedValueOnce(new Error('Fernet key missing'));

    await expect(encryptFields({ username: 'pensioner' })).rejects.toThrow('Fernet key missing');
  });
});

describe('decryptFields', () => {
  it('stays synchronous', () => {
    // Not `resolves` — decrypting needs no IV, so there is no reason to make
    // every response-decoding call site await.
    expect(decryptFields('enc(solo)')).toBe('solo');
  });

  it('decrypts strings nested through objects and arrays', () => {
    const input = {
      username: 'enc(pensioner)',
      meta: { ppo: 'enc(12345)', tags: ['enc(a)', 'enc(b)'] },
    };

    expect(decryptFields(input)).toEqual({
      username: 'pensioner',
      meta: { ppo: '12345', tags: ['a', 'b'] },
    });
  });

  it('leaves non-string leaves untouched', () => {
    expect(decryptFields({ count: 7, missing: null })).toEqual({
      count: 7,
      missing: null,
    });
  });

  it('delegates to decryptText, never to the now-async encryptText', () => {
    // Guards against a copy/paste that wires the sync walk to the async
    // mapper, which would silently return a tree full of pending promises.
    decryptFields({ username: 'enc(pensioner)' });

    expect(mockDecryptText).toHaveBeenCalledWith('enc(pensioner)');
    expect(mockEncryptText).not.toHaveBeenCalled();
  });
});
