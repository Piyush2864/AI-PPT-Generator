import { axiosClient } from './axiosClient';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Presentation, JobLog } from '../types/presentation.types';
import type { CreatePresentationPayload, ListPresentationsParams } from '../types/presentationForm.types';

export const presentationApi = {
  create: async (payload: CreatePresentationPayload) => {
    const { data } = await axiosClient.post<ApiResponse<{ id: string; jobId: string; status: string }>>(
      'presentations',
      payload,
    );
    return data.data;
  },

  list: async (params: ListPresentationsParams = {}) => {
    const { data } = await axiosClient.get<ApiResponse<PaginatedResponse<Presentation>>>('presentations', {
      params,
    });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await axiosClient.get<ApiResponse<Presentation>>(`presentations/${id}`);
    return data.data;
  },

  delete: async (id: string) => {
    await axiosClient.delete(`presentations/${id}`);
  },

  getJobLogs: async (id: string) => {
    const { data } = await axiosClient.get<ApiResponse<JobLog[]>>(`presentations/${id}/logs`);
    return data.data;
  },

  exportToPdf: async (id: string) => {
    const { data } = await axiosClient.post<ApiResponse<{ pdfUrl: string }>>(`presentations/${id}/export`);
    return data.data;
  },

  downloadPdf: async (id: string, filename: string) => {
    const response = await axiosClient.get(`presentations/${id}/download`, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};
