import express from 'express';
import { config } from 'dotenv';
import pinoHttp from 'pino-http';
import path from 'path';
import cors from 'cors';

// Import routes
import { healthRouter } from './routes/health';
import { usersRouter } from './routes/users';
import { messagesRouter } from './routes/messages';
import prisma from './lib/prisma';
import logger from './lib/logger';

// Load environment variables
config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_URL_ORIGINS?.split(','),
  credentials: true
}));
app.use(express.json());
app.use(pinoHttp({ logger }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/health', healthRouter);
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);

// Serve UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Server startup function
export async function startServer() {
  const port = process.env.PORT || 3000;
  
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Successfully connected to database');

    const server = app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
      logger.info(`Visit http://localhost:${port} to access the application`);
    });

    // Graceful shutdown handling
    async function gracefulShutdown(signal: string) {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      try {
        // Close server first (stop accepting new requests)
        await new Promise<void>((resolve) => {
          server.close(() => resolve());
        });
        logger.info('HTTP server closed');

        // Close database connections
        await prisma.$disconnect();
        logger.info('Database connections closed');

        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown:', err);
        process.exit(1);
      }
    }

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return { app, server };
  } catch (error) {
    logger.error({ error, stack: (error instanceof Error) ? error.stack : undefined }, 'Failed to start server');
    throw error;
  }
}

export { app, logger };
