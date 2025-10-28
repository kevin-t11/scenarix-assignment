'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

type UseSocketOptions = {
  sessionId?: string;
  onSyncAction?: (action: any) => void;
  onSyncState?: (state: any) => void;
  onUserCount?: (count: number) => void;
};

/**
 * Hook to manage socket connection and events
 * @param options - Configuration options for the socket connection
 * @returns Object containing socket instance, connection status, and emit function
 */
export function useSocket({
  onSyncAction,
  onSyncState,
  onUserCount,
  sessionId = 'room1', // default static session id
}: UseSocketOptions = {}) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to socket:', socket.id);
      setConnected(true);
      socket.emit('join_session', sessionId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected');
      setConnected(false);
    });

    socket.on('sync_action', (action: any) => {
      console.log('📥 Received sync action:', action);
      onSyncAction?.(action);
    });

    socket.on('sync_state', (state: any) => {
      console.log('📥 Received sync state:', state);
      onSyncState?.(state);
    });

    socket.on('user_count', (data: { count: number }) => {
      console.log('📥 User count:', data.count);
      onUserCount?.(data.count);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl, sessionId, onSyncAction, onSyncState, onUserCount]);

  const emit = (event: string, payload: any = {}) => {
    if (!socketRef.current) return;
    socketRef.current.emit(event, { ...payload, sessionId });
  };

  return { socket: socketRef.current, connected, emit } as const;
}
