import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { Slide } from '../types/presentation.types';

export const slideApi = {
  updateSlide: async (
    presentationId: string,
    slideId: string,
    payload: { title?: string; content?: string; notes?: string | null },
  ) => {
    const { data } = await axiosClient.patch<ApiResponse<Slide>>(
      `/presentations/${presentationId}/slides/${slideId}`,
      payload,
    );
    return data.data;
  },

  reorderSlides: async (
    presentationId: string,
    slides: { slideId: string; order: number }[],
  ) => {
    const { data } = await axiosClient.patch<ApiResponse<Slide[]>>(
      `/presentations/${presentationId}/slides/reorder`,
      { slides },
    );
    return data.data;
  },
};
