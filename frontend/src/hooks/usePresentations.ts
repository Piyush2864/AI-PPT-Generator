import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { presentationApi } from '../api/presentation.api';
import type { ListPresentationsParams } from '../types/presentationForm.types';

export const presentationKeys = {
  all: ['presentations'] as const,
  list: (params: ListPresentationsParams) => ['presentations', 'list', params] as const,
  detail: (id: string) => ['presentations', 'detail', id] as const,
  logs: (id: string) => ['presentations', 'logs', id] as const,
};

export function usePresentationList(params: ListPresentationsParams = {}) {
  return useQuery({
    queryKey: presentationKeys.list(params),
    queryFn: () => presentationApi.list(params),
    placeholderData: (prev) => prev, 
  });
}

export function usePresentation(id: string | undefined) {
  return useQuery({
    queryKey: presentationKeys.detail(id ?? ''),
    queryFn: () => presentationApi.getById(id as string),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 4000 : false;
    },
  });
}

export function usePresentationJobLogs(id: string | undefined) {
  return useQuery({
    queryKey: presentationKeys.logs(id ?? ''),
    queryFn: () => presentationApi.getJobLogs(id as string),
    enabled: !!id,
  });
}

export function useCreatePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: presentationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentationKeys.all });
      toast.success('Presentation generation started');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useDeletePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: presentationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentationKeys.all });
      toast.success('Presentation deleted');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useExportPresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: presentationApi.exportToPdf,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: presentationKeys.detail(id) });
      toast.success('PDF export ready');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

function extractErrorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } } };
  return anyErr?.response?.data?.message || 'Something went wrong. Please try again.';
}
