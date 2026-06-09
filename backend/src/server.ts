import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import database from './database';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`UNCAUGHT EXCEPTION! Shutting down... \n${err.name}: ${err.message}\n${err.stack}`);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    await database.connect();

    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error(`UNHANDLED REJECTION! Shutting down... \n${err.name}: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        logger.info('HTTP server closed.');
        await database.disconnect();
        process.exit(0);
      });
    });

  } catch (error: any) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
