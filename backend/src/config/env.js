import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';

// Load env variables
dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(5000),
    DATABASE_URL: Joi.string().required().description('PostgreSQL connection URL'),
    JWT_ACCESS_SECRET: Joi.string().required().description('JWT access token secret'),
    JWT_REFRESH_SECRET: Joi.string().required().description('JWT refresh token secret'),
    JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRY: Joi.string().default('7d'),
    SMTP_HOST: Joi.string().allow(''),
    SMTP_PORT: Joi.number().default(2525),
    SMTP_USER: Joi.string().allow(''),
    SMTP_PASS: Joi.string().allow(''),
    SMTP_FROM: Joi.string().allow('').default('noreply@company.com'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  dbUrl: envVars.DATABASE_URL,
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpiry: envVars.JWT_ACCESS_EXPIRY,
    refreshExpiry: envVars.JWT_REFRESH_EXPIRY,
  },
  smtp: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    auth: {
      user: envVars.SMTP_USER,
      pass: envVars.SMTP_PASS,
    },
    from: envVars.SMTP_FROM,
  },
};
