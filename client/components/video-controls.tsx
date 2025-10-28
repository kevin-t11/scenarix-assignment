'use client';

import { Button } from '@/components/ui/button';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';

interface VideoControlsProps {
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  disabled?: boolean;
  isPlaying: boolean;
}

export function VideoControls({
  onPlayPause,
  onSeek,
  disabled,
  isPlaying,
}: VideoControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onSeek(-10)}
        disabled={disabled}
        className="h-12 w-12 rounded-full border-border/50 hover:bg-accent hover:text-accent-foreground"
      >
        <SkipBack className="w-5 h-5" />
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={onPlayPause}
        disabled={disabled}
        className="h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onSeek(10)}
        disabled={disabled}
        className="h-12 w-12 rounded-full border-border/50 hover:bg-accent hover:text-accent-foreground"
      >
        <SkipForward className="w-5 h-5" />
      </Button>
    </div>
  );
}
