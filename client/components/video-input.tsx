'use client';

import type React from 'react';

import { extractYouTubeId } from '@/app/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2 } from 'lucide-react';
import { useState } from 'react';

interface VideoInputProps {
  onVideoChange: (videoId: string) => void;
}

export function VideoInput({ onVideoChange }: VideoInputProps) {
  const [url, setUrl] = useState('');

  const extractVideoId = (raw: string) => extractYouTubeId(raw);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with URL:', url);

    const videoId = extractVideoId(url);
    console.log('Extracted video ID:', videoId);

    if (videoId) {
      try {
        onVideoChange(videoId);
        setUrl('');
      } catch (error) {
        console.error('Error in onVideoChange:', error);
      }
    } else {
      console.log('Invalid video URL');
    }
  };

  const isValidUrl = url.trim() !== '' && extractVideoId(url) !== null;

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Paste YouTube URL or video ID..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="pl-10 h-12 bg-card border-border/50 focus-visible:ring-accent"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={!isValidUrl}
        className="px-8 h-12 text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Load Video
      </Button>
    </form>
  );
}
