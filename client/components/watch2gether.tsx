'use client';

import { useSocket } from '@/app/hooks/use-socket';
import { useVideoSync } from '@/app/hooks/use-video-sync';
import { withLivePlayer } from '@/app/utils/index';
import { ConnectionStatus } from '@/components/connection-status';
import { VideoControls } from '@/components/video-controls';
import { VideoInput } from '@/components/video-input';
import { Play, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { type YouTubePlayer } from 'react-youtube';

const YouTube = dynamic(() => import('react-youtube'), { ssr: false });

export function Watch2gether() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userCount, setUserCount] = useState(0);

  const { handleSyncAction, emitPlay, emitPause, emitSeek, isSyncingRef } =
    useVideoSync(player, isReady);

  // Handle sync actions from other users
  const onSyncAction = useCallback(
    (action: any) => {
      handleSyncAction(action);

      // Update local state
      if (action.type === 'play') setIsPlaying(true);
      if (action.type === 'pause') setIsPlaying(false);
      if (action.type === 'video_change' && action.videoId) {
        setVideoId(action.videoId);
        setIsPlaying(false);
      }
    },
    [handleSyncAction],
  );

  // Handle initial state when joining
  const handleSyncState = useCallback(
    (state: any) => {
      console.log('📥 Initial state:', state);
      if (state.videoId) {
        setVideoId(state.videoId);
        setIsPlaying(state.isPlaying);

        if (player && isReady) {
          withLivePlayer(player, p => p.seekTo(state.currentTime || 0, true));
          if (state.isPlaying) {
            withLivePlayer(player, p => p.playVideo());
          }
        }
      }
      if (state.userCount !== undefined) {
        setUserCount(state.userCount);
      }
    },
    [player, isReady],
  );

  const handleUserCount = useCallback((count: number) => {
    setUserCount(count);
  }, []);

  const { connected, emit } = useSocket({
    onSyncAction,
    onSyncState: handleSyncState,
    onUserCount: handleUserCount,
    sessionId: 'room1',
  });

  // Reset player on video change
  useEffect(() => {
    if (videoId) {
      setIsReady(false);
      setPlayer(null);
    }
  }, [videoId]);

  // Player ready
  const onReady = (event: { target: YouTubePlayer }) => {
    console.log('✅ YouTube player ready');
    setPlayer(event.target);
    setIsReady(true);
  };

  // Player events
  const onPlay = useCallback(() => {
    console.log('▶️ Emitting play');
    emitPlay(emit);
    setIsPlaying(true);
  }, [emitPlay, emit]);

  const onPause = useCallback(() => {
    console.log('⏸️ Emitting pause');
    emitPause(emit);
    setIsPlaying(false);
  }, [emitPause, emit]);

  const handleSeek = useCallback(
    (seconds: number) => {
      console.log('⏩ Seeking');
      emitSeek(emit, seconds);
    },
    [emitSeek, emit],
  );

  const handleVideoChange = useCallback(
    (newVideoId: string) => {
      console.log('🎬 Changing video to:', newVideoId);
      setVideoId(newVideoId);
      emit('video_change', { videoId: newVideoId });
    },
    [emit],
  );

  const handlePlayPause = useCallback(async () => {
    if (!player || !isReady) return;
    const state = await player.getPlayerState();

    if (state === 1) {
      // playing
      onPause();
    } else {
      // paused or ended
      onPlay();
    }
  }, [player, isReady, onPlay, onPause]);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Play className="w-4 h-4 fill-accent-foreground text-accent-foreground" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                Watch2gether
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 bg-background/50">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{userCount}</span>
            </div>
            <ConnectionStatus connected={connected} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <VideoInput onVideoChange={handleVideoChange} />

          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-border/50">
            {videoId ? (
              <YouTube
                key={videoId}
                videoId={videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    fs: 0,
                    iv_load_policy: 3,
                    disablekb: 1,
                    playsinline: 1,
                    origin:
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : '',
                  },
                }}
                onReady={onReady}
                onPlay={onPlay}
                onPause={onPause}
                onError={e => console.error('YouTube player error:', e)}
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <Play className="w-10 h-10 text-neutral-400" />
                  </div>
                  <p className="text-lg font-medium text-white">
                    No video playing
                  </p>
                  <p className="text-sm text-neutral-400">
                    Enter a YouTube URL above to start watching together
                  </p>
                </div>
              </div>
            )}
          </div>

          {videoId && (
            <VideoControls
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              disabled={!isReady}
              isPlaying={isPlaying}
            />
          )}
        </div>
      </main>
    </div>
  );
}
