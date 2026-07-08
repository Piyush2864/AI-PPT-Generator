import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { slideApi } from '../api/slide.api';
import { presentationKeys } from './usePresentations';
import type { Presentation, Slide } from '../types/presentation.types';

export function useUpdateSlide(presentationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slideId,
      payload,
    }: {
      slideId: string;
      payload: { title?: string; content?: string; notes?: string | null };
    }) => slideApi.updateSlide(presentationId, slideId, payload),

    onSuccess: (updatedSlide) => {
      
      queryClient.setQueryData<Presentation | undefined>(
        presentationKeys.detail(presentationId),
        (old) => {
          if (!old?.slides) return old;
          return {
            ...old,
            slides: old.slides.map((s) =>
              s.id === updatedSlide.id ? { ...s, ...updatedSlide } : s,
            ),
          };
        },
      );
      toast.success('Slide saved');
    },

    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to save slide');
    },
  });
}

export function useReorderSlides(presentationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slides: { slideId: string; order: number }[]) =>
      slideApi.reorderSlides(presentationId, slides),

   
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: presentationKeys.detail(presentationId) });
      const previous = queryClient.getQueryData<Presentation>(presentationKeys.detail(presentationId));

      queryClient.setQueryData<Presentation | undefined>(
        presentationKeys.detail(presentationId),
        (old) => {
          if (!old?.slides) return old;
          const orderMap = new Map(newOrder.map((o) => [o.slideId, o.order]));
          return {
            ...old,
            slides: [...old.slides]
              .map((s) => ({ ...s, order: orderMap.get(s.id) ?? s.order }))
              .sort((a, b) => a.order - b.order),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      
      if (context?.previous) {
        queryClient.setQueryData(presentationKeys.detail(presentationId), context.previous);
      }
      toast.error('Failed to reorder slides');
    },

    onSuccess: (reorderedSlides: Slide[]) => {
      queryClient.setQueryData<Presentation | undefined>(
        presentationKeys.detail(presentationId),
        (old) => (old ? { ...old, slides: reorderedSlides } : old),
      );
    },
  });
}
