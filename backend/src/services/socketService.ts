import { Server as SocketServer, Socket } from 'socket.io';
import { Server } from 'http';
import { SocketEvent } from '../types/socket';
import { authService } from './authService';

class SocketService {
  private io: SocketServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // microsoftId -> Set of socketIds

  constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:3000',
          'https://app.teamscorecards.online'
        ],
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {

      console.log('Client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (token: string) => {
        const decoded = authService.verifyToken(token);
        if (!decoded) {
          socket.disconnect();
          return;
        }
        const microsoftId = decoded.id;
        console.log('User authenticated:', microsoftId);
        this.handleUserConnection(socket, microsoftId);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle performance agreement events
      socket.on(SocketEvent.PERFORMANCE_AGREEMENT_UPDATE, (data) => {
        this.handlePerformanceAgreement(socket, data);
      });

      // Handle assessment events
      socket.on(SocketEvent.ASSESSMENT_UPDATE, (data) => {
        this.handleAssessment(socket, data);
      });
    });
  }

  private handleUserConnection(socket: Socket, microsoftId: string): void {
    // Add socket to user's room
    socket.join(`user:${microsoftId}`);
    socket.data = { microsoftId };
    
    // Track connected socket
    if (!this.connectedUsers.has(microsoftId)) {
      this.connectedUsers.set(microsoftId, new Set());
    }
    this.connectedUsers.get(microsoftId)?.add(socket.id);
    
    console.log(`User authenticated: ${microsoftId}, Socket: ${socket.id}`);
  }

  private handleDisconnect(socket: Socket): void {
    const microsoftId = socket.data?.microsoftId;
    if (microsoftId) {
      this.connectedUsers.get(microsoftId)?.delete(socket.id);
      if (this.connectedUsers.get(microsoftId)?.size === 0) {
        this.connectedUsers.delete(microsoftId);
      }
      console.log(`User disconnected: ${microsoftId}, Socket: ${socket.id}`);
    }
  }

  private handlePerformanceAgreement(socket: Socket, data: any): void {
    const { recipientId, status } = data;
    if (recipientId) {
      this.emitToUser(recipientId, SocketEvent.PERFORMANCE_AGREEMENT_UPDATE, {
        senderId: socket.data?.microsoftId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleAssessment(socket: Socket, data: any): void {
    const { recipientId, status } = data;
    if (recipientId) {
      this.emitToUser(recipientId, SocketEvent.ASSESSMENT_UPDATE, {
        senderId: socket.data?.microsoftId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }

  public emitToUser(microsoftId: string, event: string, data: any): void {
    this.io.to(`user:${microsoftId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  public isUserConnected(microsoftId: string): boolean {
    return this.connectedUsers.has(microsoftId);
  }
}

export default SocketService; 