import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socketService';

interface SocketContextType {
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState(socketService.getConnectionStatus());

  useEffect(() => {
    const statusCheck = setInterval(() => {
      setConnectionStatus(socketService.getConnectionStatus());
    }, 1000);

    return () => {
      clearInterval(statusCheck);
      socketService.disconnect();
    };
  }, []);

  const value = {
    isConnected: socketService.isConnected(),
    connectionStatus,
    reconnect: socketService.reconnect.bind(socketService)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}; 