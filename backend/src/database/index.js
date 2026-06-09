const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Database connection manager
 * Handles connection, disconnection, and event logging
 */
class Database {
  constructor() {
    this._isConnected = false;
    this._uri = null;
  }

  /**
   * Connects to MongoDB
   * @param {string} uri - MongoDB connection URI
   * @returns {Promise<void>}
   */
  async connect(uri) {
    if (this._isConnected) {
      logger.warn('Database already connected');
      return;
    }

    this._uri = uri;

    mongoose.connection.on('connected', () => {
      this._isConnected = true;
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      this._isConnected = false;
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      this._isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  /**
   * Disconnects from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this._isConnected) return;
    await mongoose.connection.close();
    this._isConnected = false;
    logger.info('MongoDB connection closed');
  }

  /**
   * Returns connection status
   * @returns {boolean}
   */
  isConnected() {
    return this._isConnected;
  }
}

module.exports = new Database();
