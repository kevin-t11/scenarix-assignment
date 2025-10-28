/**
 * Singleton SessionManager to handle session state and synchronization
 */
export class SessionManager {
  private static instance: SessionManager;

  /** Current YouTube video ID being watched */
  private videoId: string | null = null;

  /** Whether the video is currently playing */
  private isPlaying: boolean = false;

  /** Current playback time in seconds */
  private currentTime: number = 0;

  /** Set of connected user socket IDs */
  private users: Set<string> = new Set();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Gets the singleton instance of SessionManager
   * Creates a new instance if one doesn't exist
   *
   * @returns The singleton SessionManager instance
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Adds a user to the session
   *
   * @param socketId - The socket.io socket ID of the user
   * @returns The new total user count
   */
  public addUser(socketId: string): number {
    this.users.add(socketId);
    console.log(`✅ User ${socketId} joined. Total: ${this.users.size}`);
    return this.users.size;
  }

  /**
   * Removes a user from the session
   *
   * @param socketId - The socket.io socket ID of the user
   * @returns The new total user count
   */
  public removeUser(socketId: string): number {
    this.users.delete(socketId);
    console.log(`❌ User ${socketId} left. Total: ${this.users.size}`);
    return this.users.size;
  }

  /**
   * Gets the current number of connected users
   *
   * @returns The total user count
   */
  public getUserCount(): number {
    return this.users.size;
  }

  /**
   * Sets the current video and resets playback state
   *
   * @param videoId - The YouTube video ID
   */
  public setVideoId(videoId: string): void {
    this.videoId = videoId;
    this.isPlaying = false;
    this.currentTime = 0;
  }

  /**
   * Sets the playing state and optionally updates current time
   *
   * @param isPlaying - Whether the video should be playing
   * @param currentTime - Optional current playback time in seconds
   */
  public setPlaying(isPlaying: boolean, currentTime?: number): void {
    this.isPlaying = isPlaying;
    if (currentTime !== undefined) {
      this.currentTime = currentTime;
    }
  }

  /**
   * Sets the current playback time
   *
   * @param currentTime - The playback time in seconds
   */
  public setCurrentTime(currentTime: number): void {
    this.currentTime = currentTime;
  }

  /**
   * Gets the current session state
   *
   * @returns Object containing videoId, isPlaying, currentTime, and userCount
   */
  public getState() {
    return {
      videoId: this.videoId,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      userCount: this.users.size,
    };
  }
}
