import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeDatabase, closeDatabase } from './utils/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { passwordProtection } from './middleware/passwordProtection';
import { setupCollaborationHandler } from './websocket/collaborationHandler';
import { exportService } from './services/exportService';
import presentationsRouter from './routes/presentations';
import slidesRouter from './routes/slides';
import settingsRouter from './routes/settings';
import aiRouter from './routes/ai';
import imagesRouter from './routes/images';
import translationRouter from './routes/translation';
import exportRouter from './routes/export';
import voiceRouter from './routes/voice';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

initializeDatabase();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/presentations', passwordProtection, presentationsRouter);
app.use('/api/slides', passwordProtection, slidesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/ai', passwordProtection, aiRouter);
app.use('/api/images', passwordProtection, imagesRouter);
app.use('/api/translation', passwordProtection, translationRouter);
app.use('/api/export', passwordProtection, exportRouter);
app.use('/api/voice', passwordProtection, voiceRouter);

app.use(notFoundHandler);
app.use(errorHandler);

setupCollaborationHandler(io);
exportService.setSocketIO(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

export { app, httpServer, io };
