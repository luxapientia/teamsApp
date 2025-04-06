import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3001;

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://app.teamscorecards.online'
    ],
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


// Start server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 