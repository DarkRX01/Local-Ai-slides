import { io, Socket } from 'socket.io-client';
import { User, SlideElement } from '@/types';

export type WebSocketEvent =
  | 'user:joined'
  | 'user:left'
  | 'cursor:move'
  | 'element:update'
  | 'element:create'
  | 'element:delete'
  | 'slide:change'
  | 'export:progress';

interface WebSocketCallbacks {
  onUserJoined?: (user: User) => void;
  onUserLeft?: (userId: string) => void;
  onCursorMove?: (userId: string, position: { x: number; y: number }) => void;
  onElementUpdate?: (element: SlideElement) => void;
  onElementCreate?: (element: SlideElement) => void;
  onElementDelete?: (elementId: string) => void;
  onSlideChange?: (slideId: string, userId: string) => void;
  onExportProgress?: (jobId: string, progress: number) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(presentationId: string, user: User): void {
    if (this.socket?.connected) {
      console.warn('WebSocket already connected');
      return;
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.socket?.emit('join', { presentationId, user });
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.callbacks.onError?.(error);
    });

    this.socket.on('user:joined', (user: User) => {
      this.callbacks.onUserJoined?.(user);
    });

    this.socket.on('user:left', (userId: string) => {
      this.callbacks.onUserLeft?.(userId);
    });

    this.socket.on('cursor:move', (data: { userId: string; position: { x: number; y: number } }) => {
      this.callbacks.onCursorMove?.(data.userId, data.position);
    });

    this.socket.on('element:update', (element: SlideElement) => {
      this.callbacks.onElementUpdate?.(element);
    });

    this.socket.on('element:create', (element: SlideElement) => {
      this.callbacks.onElementCreate?.(element);
    });

    this.socket.on('element:delete', (elementId: string) => {
      this.callbacks.onElementDelete?.(elementId);
    });

    this.socket.on('slide:change', (data: { slideId: string; userId: string }) => {
      this.callbacks.onSlideChange?.(data.slideId, data.userId);
    });

    this.socket.on('export:progress', (data: { jobId: string; progress: number }) => {
      this.callbacks.onExportProgress?.(data.jobId, data.progress);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(callbacks: WebSocketCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  emit(event: WebSocketEvent, data: unknown): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, cannot emit event:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  emitCursorMove(position: { x: number; y: number }): void {
    this.emit('cursor:move', position);
  }

  emitElementUpdate(element: SlideElement): void {
    this.emit('element:update', element);
  }

  emitElementCreate(element: SlideElement): void {
    this.emit('element:create', element);
  }

  emitElementDelete(elementId: string): void {
    this.emit('element:delete', elementId);
  }

  emitSlideChange(slideId: string): void {
    this.emit('slide:change', slideId);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const websocket = new WebSocketClient();
export default websocket;
