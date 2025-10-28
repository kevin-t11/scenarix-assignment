# Watch2gether Server

A lightweight, real-time synchronized video watching server built with Node.js, Socket.io, and Express.

## Features

### Core Functionality

- **Real-time Synchronization**: Video playback synchronized across all connected users
- **Instant State Sync**: New users receive current video state immediately upon joining
- **User Tracking**: Live user count updates across all clients
- **Simple & Fast**: Minimal overhead with clean architecture

### Technical Features

- **Singleton Pattern**: SessionManager ensures single source of truth
- **Separation of Concerns**: Socket handlers isolated from server logic
- **Minimal Dependencies**: Lightweight and performant
- **Type Safety**: Full TypeScript support

## Architecture

### SessionManager (Singleton)

The core component that manages the global watch session state:

```typescript
class SessionManager {
  private static instance: SessionManager;
  private videoId: string | null;
  private isPlaying: boolean;
  private currentTime: number;
  private users: Set<string>;

  public static getInstance(): SessionManager;
  public addUser(socketId: string): number;
  public removeUser(socketId: string): number;
  public setVideoId(videoId: string): void;
  public setPlaying(isPlaying: boolean, currentTime?: number): void;
  public setCurrentTime(currentTime: number): void;
  public getState(): SessionState;
}
```

### File Structure

```
server/src/
├── index.ts              # Server setup and Socket.io initialization
├── session-manager.ts    # Singleton state manager
├── socket-handlers.ts    # Socket event handlers
└── utils/
    └── validation.ts     # Input validation utilities
```

### Key Components

1. **index.ts**
   - Express server setup
   - Socket.io configuration
   - CORS configuration
   - Event handler registration

2. **session-manager.ts**
   - Singleton pattern implementation
   - Centralized state management
   - User tracking
   - Video state synchronization

3. **socket-handlers.ts**
   - `handleJoinSession` - New user joins
   - `handlePlay` - Play video action
   - `handlePause` - Pause video action
   - `handleSeek` - Seek video action
   - `handleVideoChange` - Change video action
   - `handleDisconnect` - User disconnect cleanup

### New User Joins

```
1. Client connects via Socket.io
2. Client emits 'join_session' with sessionId
3. Server adds user to SessionManager
4. Server sends current state via 'sync_state'
5. Server broadcasts updated user count
```

### Video Action (Play/Pause/Seek)

```
1. User A performs action (e.g., play)
2. Client emits action with currentTime
3. Server updates SessionManager state
4. Server broadcasts 'sync_action' to all other users
5. Other clients receive and apply the action
```

### Video Change

```
1. User A changes video
2. Client emits 'video_change' with videoId
3. Server resets playback state (time=0, paused)
4. Server broadcasts to all other users
5. All clients load the new video
```

## Running the Server

### Development

```bash
cd server
bun install
bun run dev
```

### Production

```bash
cd server
bun install
bun run start
```

## How It Works

### Synchronization Mechanism

1. **Server as Source of Truth**: SessionManager maintains the authoritative state
2. **Broadcast Pattern**: Actions are broadcast to all users except the sender
3. **State on Join**: New joiners immediately receive current state
4. **Time Sync**: CurrentTime is sent with every play/pause action for perfect sync

### User Management

- Users tracked by socket.id
- Automatic removal on disconnect
- Live count updates broadcasted to all clients

### Manual Testing

```bash
# Terminal 1: Start server
bun run dev

# Terminal 2: Test with curl
curl http://localhost:8000/

# Use browser dev tools to test Socket.io events
```

### Socket.io Client Testing

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:8000');

socket.on('connect', () => {
  socket.emit('join_session', 'room1');
});

socket.on('sync_state', (state) => {
  console.log('Initial state:', state);
});
```
