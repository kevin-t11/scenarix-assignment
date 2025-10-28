import { type YouTubePlayer } from 'react-youtube';

/**
 * Extracts the YouTube video ID from a given URL or direct ID input.
 *
 * @param url - The YouTube video URL or direct ID string.
 * @returns The 11-character YouTube video ID, or null if not found.
 *
 * @example
 * extractYouTubeId('https://youtube.com/watch?v=abcdefghijk'); // 'abcdefghijk'
 * extractYouTubeId('abcdefghijk'); // 'abcdefghijk'
 */
export function extractYouTubeId(url: string): string | null {
  try {
    const patterns = [
      /v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /embed\/([a-zA-Z0-9_-]{11})/,
      /v\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the HTMLIFrameElement associated with a YouTubePlayer instance.
 *
 * @param player - The YouTubePlayer instance.
 * @returns The player's HTMLIFrameElement, or null if not found or unavailable.
 */
function getIframeFromPlayer(player: YouTubePlayer): HTMLIFrameElement | null {
  try {
    if (!player || typeof player.getIframe !== 'function') return null;
    const iframe = player.getIframe() as unknown as HTMLIFrameElement;
    return iframe ?? null;
  } catch {
    return null;
  }
}

/**
 * Checks if the provided iframe element is still attached to the DOM.
 *
 * @param iframe - The HTMLIFrameElement to check.
 * @returns True if the iframe is attached; false otherwise.
 */
function isIframeAttached(iframe: HTMLIFrameElement | null): boolean {
  if (!iframe) return false;
  const anyIframe = iframe as any;
  if (typeof anyIframe.isConnected === 'boolean') return anyIframe.isConnected;
  return typeof document !== 'undefined' && document.body.contains(iframe);
}

/**
 * Determines whether a given YouTubePlayer's iframe is currently attached to the DOM.
 *
 * @param player - The YouTubePlayer instance to check.
 * @returns True if the player's iframe is attached; false otherwise.
 */
export function isPlayerAttached(player: YouTubePlayer): boolean {
  return isIframeAttached(getIframeFromPlayer(player));
}

/**
 * Executes a callback action with the YouTubePlayer only if both the player and its iframe are live/attached.
 *
 * @param player - The YouTubePlayer instance (or null).
 * @param action - The callback function to execute, which receives the player instance.
 * @returns The result of the action if executed, or null if the player/iframe is unavailable.
 *
 * @template T
 */
export function withLivePlayer<T>(
  player: YouTubePlayer | null,
  action: (p: YouTubePlayer) => T,
): T | null {
  if (!player) return null;
  if (!isPlayerAttached(player)) return null;
  try {
    return action(player);
  } catch {
    return null;
  }
}
