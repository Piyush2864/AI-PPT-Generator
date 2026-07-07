import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '../api/tokenStorage';
import { useAuth } from '../context/AuthContext';
import { presentationKeys } from './usePresentations';
import type { Presentation } from '../types/presentation.types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

interface PresentationStatusUpdate {
  presentationId: string;
  status: Presentation['status'];
  failureReason?: string | null;
  progress?: string;
}


export function useRealtimePresentationUpdates() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('presentation:status_update', (payload: PresentationStatusUpdate) => {
      queryClient.setQueryData<Presentation | undefined>(
        presentationKeys.detail(payload.presentationId),
        (old) => (old ? { ...old, status: payload.status, failureReason: payload.failureReason ?? old.failureReason } : old),
      );

      queryClient.setQueriesData<{ items: Presentation[] } | undefined>(
        { queryKey: presentationKeys.all },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((p) =>
              p.id === payload.presentationId
                ? { ...p, status: payload.status, failureReason: payload.failureReason ?? p.failureReason }
                : p,
            ),
          };
        },
      );

      if (payload.status === 'COMPLETED' || payload.status === 'FAILED') {
        queryClient.invalidateQueries({ queryKey: presentationKeys.detail(payload.presentationId) });
        queryClient.invalidateQueries({ queryKey: presentationKeys.logs(payload.presentationId) });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient]);

  return socketRef;
}
