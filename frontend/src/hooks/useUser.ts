import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userApi } from '../api/user.api';
import { useAuth } from '../context/AuthContext';

export const userKeys = {
  profile: ['user', 'profile'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: userApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.profile, updatedUser);
      localStorage.setItem('sf_user', JSON.stringify({ ...user, name: updatedUser.name }));
      toast.success('Name updated successfully');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to update profile');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed. Please log in again on other devices.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to change password');
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: userApi.deleteAccount,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to delete account');
    },
  });
}
