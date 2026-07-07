import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { AuthResponse, LoginPayload, SignupPayload } from '../types/auth.types';

export const authApi = {
  signup: async (payload: SignupPayload) => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/signup', payload);
    return data.data;
  },

  login: async (payload: LoginPayload) => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return data.data;
  },

  logout: async (refreshToken: string) => {
    await axiosClient.post('auth/logout', { refreshToken });
  },
};
