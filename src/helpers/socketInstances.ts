import { Server } from 'socket.io';

// Type-safe socket instance export

export let socketIO: Server | null = null;

export const setSocketIO = (io: Server) => {
  socketIO = io;
};

export const getSocketIO = (): Server | null => {
  return socketIO;
};


// Generic emit function
export const emitEvent = (
    event: string,
    data: any,
    room?: string
  ): boolean => {
    if (!socketIO) {
      console.warn(`Socket.IO not initialized - Skipping event: ${event}`);
      return false;
    }
  
    try {
      // Double check socketIO is still available before emitting
      if (!socketIO) {
        console.warn(`Socket.IO became null during emit - Skipping event: ${event}`);
        return false;
      }
      
      if (room) {
        socketIO.to(room).emit(event, data);
      } else {
        socketIO.emit(event, data);
      }
      return true;
    } catch (error) {
      console.error(`Socket emit failed for event ${event}:`, error);
      return false;
    }
  };