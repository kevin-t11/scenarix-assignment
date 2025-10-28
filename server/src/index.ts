import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import {
  handleDisconnect,
  handleJoinSession,
  handlePause,
  handlePlay,
  handleSeek,
  handleVideoChange,
} from './socket-handlers';

const app = express();
const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

const port = 8000;

// Socket connection handler
io.on('connection', (socket) => {
  socket.on('join_session', handleJoinSession(socket, io));
  socket.on('play', handlePlay(socket));
  socket.on('pause', handlePause(socket));
  socket.on('seek', handleSeek(socket));
  socket.on('video_change', handleVideoChange(socket));
  socket.on('disconnect', handleDisconnect(socket, io));
});

app.get('/', (req, res) => {
  res.send('Watch2gether Server running!');
});

server.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
