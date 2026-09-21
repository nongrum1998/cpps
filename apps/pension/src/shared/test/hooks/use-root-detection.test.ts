import { useRootDetection } from '@hooks/use-root-detection';
import { renderHook, waitFor } from '@testing-library/react-native';
import JailMonkey from 'jail-monkey';

jest.mock('jail-monkey', () => ({
  __esModule: true,
  default: {
    isJailBroken: jest.fn(() => false),
    isDebuggedMode: jest.fn(async () => false),
  },
}));

const mockedJailMonkey = JailMonkey as jest.Mocked<typeof JailMonkey>;

/** Override the `__DEV__` global used by the hook to gate dev-only behaviour. */
const setDevMode = (value: boolean) => {
  Object.defineProperty(globalThis, '__DEV__', { value, configurable: true });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedJailMonkey.isJailBroken.mockReturnValue(false);
  mockedJailMonkey.isDebuggedMode.mockResolvedValue(false);
});

afterEach(() => {
  setDevMode(true);
});

describe('useRootDetection', () => {
  describe('development mode', () => {
    beforeEach(() => setDevMode(true));

    it('is never blocked and skips all native checks', async () => {
      const { result } = await renderHook(() => useRootDetection());

      expect(result.current.isBlocked).toBe(false);
      expect(result.current.isChecking).toBe(false);
      expect(result.current.isJailBroken).toBe(false);
      expect(result.current.isDebugged).toBe(false);
      expect(mockedJailMonkey.isJailBroken).not.toHaveBeenCalled();
      expect(mockedJailMonkey.isDebuggedMode).not.toHaveBeenCalled();
    });
  });

  describe('production mode', () => {
    beforeEach(() => setDevMode(false));

    it('is not blocked when device is clean', async () => {
      const { result } = await renderHook(() => useRootDetection());

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
      });

      expect(result.current.isBlocked).toBe(false);
      expect(result.current.isJailBroken).toBe(false);
      expect(result.current.isDebugged).toBe(false);
    });

    it('is blocked immediately when device is jailbroken', async () => {
      mockedJailMonkey.isJailBroken.mockReturnValue(true);

      const { result } = await renderHook(() => useRootDetection());

      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isJailBroken).toBe(true);
      expect(result.current.isChecking).toBe(false);
      // Async check should be skipped since jailbreak is already confirmed.
      expect(mockedJailMonkey.isDebuggedMode).not.toHaveBeenCalled();
    });

    it('is blocked when debugger is attached', async () => {
      let resolveDebugMode!: (value: boolean) => void;
      mockedJailMonkey.isDebuggedMode.mockImplementation(
        () => new Promise<boolean>((resolve) => (resolveDebugMode = resolve))
      );

      const { result } = await renderHook(() => useRootDetection());

      expect(result.current.isChecking).toBe(true);
      expect(result.current.isBlocked).toBe(false);

      resolveDebugMode(true);

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
      });

      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isDebugged).toBe(true);
    });

    it('is blocked when both jailbroken and debugged', async () => {
      mockedJailMonkey.isJailBroken.mockReturnValue(true);
      mockedJailMonkey.isDebuggedMode.mockResolvedValue(true);

      const { result } = await renderHook(() => useRootDetection());

      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isJailBroken).toBe(true);
    });

    it('fails closed when jail-monkey linking throws in production', async () => {
      mockedJailMonkey.isJailBroken.mockImplementation(() => {
        throw new Error('Module not linked');
      });
      mockedJailMonkey.isDebuggedMode.mockRejectedValue(new Error('Module not linked'));

      const { result } = await renderHook(() => useRootDetection());

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
      });

      // A device whose integrity cannot be verified is treated as compromised.
      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isJailBroken).toBe(true);
    });

    it('fails closed when only the async debugger check fails', async () => {
      mockedJailMonkey.isDebuggedMode.mockRejectedValue(new Error('Module not linked'));

      const { result } = await renderHook(() => useRootDetection());

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
      });

      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isDebugged).toBe(true);
    });
  });
});
