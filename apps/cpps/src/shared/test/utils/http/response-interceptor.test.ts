import { createResponseInterceptor } from '@utils/http/response-interceptor';
import { TokenStoreManager } from '@stores/token.store';

jest.mock('@stores/token.store', () => ({
  TokenStoreManager: { addAccessToken: jest.fn(), removeTokens: jest.fn() },
}));
// Prevent native/exp-router imports from the current response.ts chain.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
// Mock the client to break the live imports cycle
// response.ts -> client.ts -> response-interceptor.ts. The real client executes
// createResponseInterceptor() at module top-level while it is still loading here.
jest.mock('@utils/http/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const addAccessToken = TokenStoreManager.addAccessToken as jest.Mock;
const removeTokens = TokenStoreManager.removeTokens as jest.Mock;
const makeResponse = (status: number, url: string, data: unknown) =>
  ({ status, data, config: { url } }) as any;

describe('createResponseInterceptor', () => {
  let handlers: readonly [(response: any) => Promise<any>, (error: any) => Promise<any>];

  beforeEach(() => {
    jest.clearAllMocks();
    handlers = createResponseInterceptor();
  });

  it('stores the access token on a successful login response', async () => {
    await handlers[0](makeResponse(200, '/login', { data: { token: 'fresh-token' } }));
    expect(addAccessToken).toHaveBeenCalledWith('fresh-token');
  });

  it('does not store a token for non-login responses', async () => {
    await handlers[0](makeResponse(200, '/api/verification/', { data: { ok: true } }));
    expect(addAccessToken).not.toHaveBeenCalled();
  });

  it('rejects when storing the login token fails', async () => {
    addAccessToken.mockRejectedValue(new Error('secure store unavailable'));
    await expect(
      handlers[0](makeResponse(200, '/login', { data: { token: 't' } }))
    ).rejects.toThrow('secure store unavailable');
  });

  it('resolves auth-path errors with the error response (login stays silent)', async () => {
    const err = { config: { url: '/login' }, response: { status: 400, data: { message: 'bad' } } };
    await expect(handlers[1](err)).resolves.toBe(err.response);
  });

  it('rejects auth-path errors without a response body', async () => {
    const err = { config: { url: '/login' } };
    await expect(handlers[1](err)).rejects.toBe(err);
  });

  it('removes tokens and passes through the response for the /user endpoint', async () => {
    const err = { config: { url: '/user' }, response: { status: 401, data: {} } };
    const result = await handlers[1](err);
    expect(removeTokens).toHaveBeenCalled();
    expect(result).toBe(err.response);
  });

  it('rejects non-auth errors (no automatic token refresh happens)', async () => {
    const err = { config: { url: '/api/verification/' }, response: { status: 500, data: {} } };
    await expect(handlers[1](err)).rejects.toBe(err);
  });

  it('rejects errors without a config', async () => {
    await expect(handlers[1]({})).rejects.toBeDefined();
  });
});
