import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per minute
});
app.use(limiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teams-score-cards';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Mount API routes
app.use('/api', routes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Teams Score Cards API',
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);

const startServer = (port: number) => {
  const server = app.listen(port)
    .on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        server.close();
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      const actualPort = (server.address() as any).port;
      console.log(`Server is running on port ${actualPort}`);
      
      // Write the port to a file that can be read by the frontend
      const fs = require('fs');
      const path = require('path');
      const envContent = `REACT_APP_API_URL=http://localhost:${actualPort}/api\n`;
      fs.writeFileSync(path.join(__dirname, '../../.env'), envContent);
    });
};

startServer(PORT); 