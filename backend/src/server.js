import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import './jobs/cron.jobs.js'; // Imports and schedules cron jobs

const server = app.listen(env.port, () => {
  logger.info(`Server is running in ${env.env} mode on port ${env.port}`);
});

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  server.close(() => {
    process.exit(1);
  });
});
