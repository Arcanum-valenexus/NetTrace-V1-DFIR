import { apiClient } from './apiClient';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserRegistrationResult {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export const authApi = {
  login: async (credentials: LoginPayload): Promise<AuthTokens> => {
    return apiClient<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuthToken: true,
    });
  },

  register: async (userData: RegisterPayload): Promise<UserRegistrationResult> => {
    return apiClient<UserRegistrationResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'Lead DFIR Investigator',
      }),
      skipAuthToken: true,
    });
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    return apiClient<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuthToken: true,
    });
  },

  logout: async (): Promise<{ message: string }> => {
    return apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },
};
