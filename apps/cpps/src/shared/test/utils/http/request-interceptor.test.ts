import { createRequestInterceptor } from '@utils/http/request-interceptor';
import { encryptFields } from '@lib/encryption';
import { TokenStoreManager } from '@stores/token.store';

jest.mock('@stores/token.store', () => ({ TokenStoreManager: { getAccessToken: jest.fn() } }));
jest.mock('@lib/encryption', () => ({ encryptFields: jest.fn() }));

const getAccessToken = TokenStoreManager.getAccessToken as jest.Mock;
const encryptFieldsMock = encryptFields as jest.Mock;

const makeConfig = (overrides: Record<string, unknown> = {}) =>
  ({ headers: {}, data: undefined, url: '/test', method: 'post', ...overrides }) as any;

beforeEach(() => jest.clearAllMocks());

describe('createRequestInterceptor', () => {
  it('attaches the Bearer token when stored and no header is set', async () => {
    getAccessToken.mockResolvedValue('token-123');
    const result = await createRequestInterceptor()(makeConfig());
    expect(result.headers.Authorization).toBe('Bearer token-123');
  });

  it('does not overwrite an existing Authorization header', async () => {
    getAccessToken.mockResolvedValue('token-123');
    const result = await createRequestInterceptor()(
      makeConfig({ headers: { Authorization: 'Bearer custom' } })
    );
    expect(result.headers.Authorization).toBe('Bearer custom');
  });

  it('encrypts plain-object bodies with the payload wrapper', async () => {
    getAccessToken.mockResolvedValue(null);
    encryptFieldsMock.mockImplementation((value: unknown) => value);
    await createRequestInterceptor()(makeConfig({ data: { ppo_no: '123' } }));
    expect(encryptFieldsMock).toHaveBeenCalledWith({ payload: JSON.stringify({ ppo_no: '123' }) });
  });

  it('passes FormData bodies through unchanged', async () => {
    getAccessToken.mockResolvedValue(null);
    const formData = new FormData();
    const result = await createRequestInterceptor()(makeConfig({ data: formData }));
    expect(result.data).toBe(formData);
    expect(encryptFieldsMock).not.toHaveBeenCalled();
  });

  it('passes URLSearchParams bodies through unchanged', async () => {
    getAccessToken.mockResolvedValue(null);
    const params = new URLSearchParams({ token: 'abc' });
    const result = await createRequestInterceptor()(makeConfig({ data: params }));
    expect(result.data).toBe(params);
    expect(encryptFieldsMock).not.toHaveBeenCalled();
  });
});
