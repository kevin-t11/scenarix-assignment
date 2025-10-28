import { Socket } from 'socket.io';
import { SessionManager } from './session-manager';

/** Singleton instance of SessionManager for state management */
const sessionManager = SessionManager.getInstance();

/**
 * Handle new user joining a session
 * @param socket - The socket instance
 * @param io - The socket.io instance
 * @returns A function that handles the join session event
 */
export function handleJoinSession(socket: Socket, io: any) {
  return (sessionId: string) => {
    socket.join(sessionId);
    const userCount = sessionManager.addUser(socket.id);

    // Send current state to new joiner
    socket.emit('sync_state', sessionManager.getState());

    // Notify all users about user count update
    io.to(sessionId).emit('user_count', { count: userCount });
  };
}

/**
 * Handle play action
 * @param socket - The socket instance
 * @returns A function that handles the play event
 */
export function handlePlay(socket: Socket) {
  return (data: { currentTime?: number; sessionId: string }) => {
    sessionManager.setPlaying(true, data.currentTime);

    socket.to(data.sessionId).emit('sync_action', {
      type: 'play',
      currentTime: sessionManager.getState().currentTime,
    });
  };
}

/**
 * Handle pause action
 * @param socket - The socket instance
 * @returns A function that handles the pause event
 */
export function handlePause(socket: Socket) {
  return (data: { currentTime?: number; sessionId: string }) => {
    sessionManager.setPlaying(false, data.currentTime);

    socket.to(data.sessionId).emit('sync_action', {
      type: 'pause',
      currentTime: sessionManager.getState().currentTime,
    });
  };
}

/**
 * Handle seek action
 * @param socket - The socket instance
 * @returns A function that handles the seek event
 */
export function handleSeek(socket: Socket) {
  return (data: { currentTime: number; sessionId: string }) => {
    sessionManager.setCurrentTime(data.currentTime);

    socket.to(data.sessionId).emit('sync_action', {
      type: 'seek',
      currentTime: data.currentTime,
    });
  };
}

/**
 * Handle video change action
 * @param socket - The socket instance
 * @returns A function that handles the video change event
 */
export function handleVideoChange(socket: Socket) {
  return (data: { videoId: string; sessionId: string }) => {
    sessionManager.setVideoId(data.videoId);

    socket.to(data.sessionId).emit('sync_action', {
      type: 'video_change',
      videoId: data.videoId,
    });
  };
}

/**
 * Handle user disconnect
 * @param socket - The socket instance
 * @param io - The socket.io instance
 * @returns A function that handles the disconnect event
 */
export function handleDisconnect(socket: Socket, io: any) {
  return () => {
    const userCount = sessionManager.removeUser(socket.id);
    io.emit('user_count', { count: userCount });
  };
}
