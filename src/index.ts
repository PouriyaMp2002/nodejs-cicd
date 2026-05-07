import { startServer } from './server';
import logger from './lib/logger';

// Start the server
startServer().catch((error) => {
  logger.error({ error, stack: (error instanceof Error) ? error.stack : undefined }, 'Failed to start application');
  process.exit(1);
});
