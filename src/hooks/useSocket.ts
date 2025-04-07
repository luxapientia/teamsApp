import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { SocketEvent } from '../types/socket';

export const useSocket = (event: SocketEvent, callback: (data: any) => void) => {
  useEffect(() => {
    const unsubscribe = socketService.subscribe(event, callback);
    return () => unsubscribe();
  }, [event, callback]);

  return {
    emit: useCallback((data: any) => {
      socketService.emit(event, data);
    }, [event]),
    subscribe: socketService.subscribe.bind(socketService),
    unsubscribe: socketService.unsubscribe.bind(socketService),
    isConnected: socketService.isConnected(),
    connectionStatus: socketService.getConnectionStatus()
  };
}; 