import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { SocketEvent } from '../types/socket';

export const useSocket = (event: SocketEvent, callback: (data: any) => void) => {
  useEffect(() => {
    const unsubscribe = socketService.subscribe(event, callback);
    return () => unsubscribe();
  }, [event, callback]);

  const emit = useCallback((data: any) => {
    socketService.emit(event, data);
  }, [event]);

  return {
    emit,
    isConnected: socketService.isConnected(),
    connectionStatus: socketService.getConnectionStatus()
  };
}; 