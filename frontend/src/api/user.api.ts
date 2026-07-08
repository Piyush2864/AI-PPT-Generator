import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/auth.types';

export const userApi = {
  getProfile: async () => {
    const { data } = await axiosClient.get<ApiResponse<User>>('/users/me');
    return data.data;
  },

  updateProfile: async (payload: { name: string }) => {
    const { data } = await axiosClient.patch<ApiResponse<User>>('/users/me', payload);
    return data.data;
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const { data } = await axiosClient.patch<ApiResponse<null>>('/users/me/password', payload);
    return data;
  },

  deleteAccount: async (payload: { password: string }) => {
    await axiosClient.delete('/users/me', { data: payload });
  },
};
