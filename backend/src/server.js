require('dotenv').config();
const app = require('./app');
const database = require('./database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap server
 */
async function bootstrap() {
  try {
    // Connect to MongoDB
    await database.connect(process.env.MONGO_URI);

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 ExpenseTracker API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      logger.info(`📌 API Base: http://localhost:${PORT}/api/v1`);
      logger.info(`🏥 Health: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Graceful shutdown...');
      server.close(async () => {
        await database.disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught Exception: ${error.message}`);
      process.exit(1);
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
