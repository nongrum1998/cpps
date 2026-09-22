import type { AxiosInstance } from 'axios';

type LoginRequest = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

type CurrentUserResponse = {
  username: string;
};

export function createAuthService(client: AxiosInstance) {
  return {
    async login(data: LoginRequest) {
      const response = await client.post<LoginResponse>('/login', data);

      return response.data;
    },

    async currentUser() {
      const response = await client.post<CurrentUserResponse>('/user', {});

      return response.data;
    },
  };
}
