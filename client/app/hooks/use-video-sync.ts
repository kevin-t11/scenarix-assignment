'use client';

import { useCallback, useRef } from 'react';
import { type YouTubePlayer } from 'react-youtube';
import { withLivePlayer } from '../utils';

export function useVideoSync(player: YouTubePlayer | null, isReady: boolean) {
  // Flag to prevent feedback loops during synchronization
  const isSyncingRef = useRef(false);

  // Handles synchronization actions from other users
  const handleSyncAction = useCallback(
    (action: any) => {
      if (!player || !isReady || isSyncingRef.current) return;

      isSyncingRef.current = true;

      try {
        switch (action.type) {
          case 'play':
            if (action.currentTime !== undefined) {
              withLivePlayer(player, p => p.seekTo(action.currentTime, true));
            }
            withLivePlayer(player, p => p.playVideo());
            break;

          case 'pause':
            if (action.currentTime !== undefined) {
              withLivePlayer(player, p => p.seekTo(action.currentTime, true));
            }
            withLivePlayer(player, p => p.pauseVideo());
            break;

          case 'seek':
            if (action.currentTime !== undefined) {
              withLivePlayer(player, p => p.seekTo(action.currentTime, true));
            }
            break;

          case 'video_change':
            // for now, video change is handled by parent component
            break;
        }
      } finally {
        // Reset syncing flag after delay to prevent feedback loops
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 500);
      }
    },
    [player, isReady],
  );

  // Emits a play action with current playback time
  const emitPlay = useCallback(
    async (emit: Function) => {
      if (isSyncingRef.current || !player) return;
      const currentTime = await player.getCurrentTime();
      emit('play', { currentTime });
    },
    [player],
  );

  // Emits a pause action with current playback time
  const emitPause = useCallback(
    async (emit: Function) => {
      if (isSyncingRef.current || !player) return;
      const currentTime = await player.getCurrentTime();
      emit('pause', { currentTime });
    },
    [player],
  );

  // Emits a seek action and updates local player
  const emitSeek = useCallback(
    async (emit: Function, seconds: number) => {
      if (!player || !isReady) return;
      const currentTime = await player.getCurrentTime();
      const newTime = Math.max(0, currentTime + seconds);
      emit('seek', { currentTime: newTime });
      withLivePlayer(player, p => p.seekTo(newTime, true));
    },
    [player, isReady],
  );

  return {
    handleSyncAction,
    emitPlay,
    emitPause,
    emitSeek,
    isSyncingRef,
  };
}
