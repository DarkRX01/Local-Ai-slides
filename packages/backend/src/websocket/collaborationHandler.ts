import { Server as SocketIOServer, Socket } from 'socket.io';

export interface CollaborationEvent {
  presentationId: string;
  slideId?: string;
  userId: string;
  action: 'update' | 'cursor' | 'selection';
  data: any;
}

export function setupCollaborationHandler(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-presentation', (presentationId: string) => {
      socket.join(`presentation:${presentationId}`);
      console.log(`Client ${socket.id} joined presentation ${presentationId}`);

      socket.to(`presentation:${presentationId}`).emit('user-joined', {
        userId: socket.id,
        presentationId
      });
    });

    socket.on('leave-presentation', (presentationId: string) => {
      socket.leave(`presentation:${presentationId}`);
      console.log(`Client ${socket.id} left presentation ${presentationId}`);

      socket.to(`presentation:${presentationId}`).emit('user-left', {
        userId: socket.id,
        presentationId
      });
    });

    socket.on('collaboration-event', (event: CollaborationEvent) => {
      socket.to(`presentation:${event.presentationId}`).emit('collaboration-event', {
        ...event,
        userId: socket.id
      });
    });

    socket.on('cursor-move', (data: { presentationId: string; x: number; y: number }) => {
      socket.to(`presentation:${data.presentationId}`).emit('cursor-move', {
        userId: socket.id,
        x: data.x,
        y: data.y
      });
    });

    socket.on('element-update', (data: { presentationId: string; slideId: string; element: any }) => {
      socket.to(`presentation:${data.presentationId}`).emit('element-update', {
        userId: socket.id,
        slideId: data.slideId,
        element: data.element
      });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
