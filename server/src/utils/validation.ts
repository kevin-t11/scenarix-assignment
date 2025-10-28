/**
 * Simple validation utilities
 */
export class ValidationUtils {
  
  /**
   * Basic validation for video change data
   */
  static validateVideoChangeData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.videoId === 'string' &&
      data.videoId.length === 11 &&
      typeof data.videoUrl === 'string'
    );
  }

  /**
   * Basic validation for seek data
   */
  static validateSeekData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.currentTime === 'number' &&
      data.currentTime >= 0
    );
  }

  /**
   * Basic validation for duration
   */
  static validateDuration(duration: any): boolean {
    return typeof duration === 'number' && duration >= 0;
  }

  /**
   * Basic validation for socket ID
   */
  static validateSocketId(socketId: string): boolean {
    return typeof socketId === 'string' && socketId.length > 0;
  }
}
