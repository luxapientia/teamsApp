import * as dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import SocketService from './services/socketService';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer(app);

// Initialize socket service
const socketService = new SocketService(httpServer);

// Start server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { socketService };