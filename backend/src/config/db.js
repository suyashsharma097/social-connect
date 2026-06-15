import { PrismaClient } from '@prisma/client';
import env from './env.js';
import logger from './logger.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.dbUrl,
    },
  },
  log: env.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

prisma.$connect()
  .then(() => {
    logger.info('Database connected successfully.');
  })
  .catch((err) => {
    logger.error(`Database connection failed: ${err.message}`);
  });

export default prisma;
