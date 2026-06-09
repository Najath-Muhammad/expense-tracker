import mongoose from 'mongoose';
import logger from '../utils/logger';

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(uri?: string): Promise<void> {
    if (this.isConnected) {
      logger.info('Database is already connected');
      return;
    }

    const mongoUri = uri || process.env.MONGO_URI;

    if (!mongoUri) {
      logger.error('MONGO_URI is not defined in environment variables');
      process.exit(1);
    }

    try {
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
      });

      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err}`);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      // If the Node process ends, close the Mongoose connection
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection disconnected through app termination');
        process.exit(0);
      });

      await mongoose.connect(mongoUri);
      this.isConnected = true;
    } catch (error: any) {
      logger.error(`Failed to connect to MongoDB: ${error.message}`);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error: any) {
      logger.error(`Error disconnecting from database: ${error.message}`);
    }
  }
}

export default Database.getInstance();
