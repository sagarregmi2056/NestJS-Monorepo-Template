import * as Joi from 'joi';
import { Logger } from '@nestjs/common';

/**
 * Joi-based Environment Validation
 * 
 * Provides fail-fast environment variable validation with detailed error messages.
 * Validates all environment variables before application startup.
 * 
 * Usage:
 * ```typescript
 * import { validateEnv } from '@app/configuration';
 * 
 * validateEnv(process.env);
 * ```
 */

// Base schema for all environments
const baseSchema = Joi.object({
  // Node Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Node environment'),

  // Database Configuration
  DB_TYPE: Joi.string()
    .valid('mongodb', 'postgresql', 'postgres', 'mysql', 'mariadb')
    .default('mongodb')
    .description('Database type'),

  DATABASE_URI: Joi.string()
    .optional()
    .description('Database connection URI'),

  DB_HOST: Joi.string().hostname().optional().description('Database host'),
  DB_PORT: Joi.number().port().optional().description('Database port'),
  DB_USERNAME: Joi.string().optional().description('Database username'),
  DB_PASSWORD: Joi.string().optional().description('Database password'),
  DB_NAME: Joi.string().optional().description('Database name'),

  // Application Configuration
  APP_NAME: Joi.string().default('NestJS App').optional().description('Application name'),
  PORT: Joi.number().port().optional().description('Default port'),
  API_SERVER_PORT: Joi.number().port().optional().description('API server port'),
  WEBSOCKET_PORT: Joi.number().port().optional().description('WebSocket service port'),
  ADMIN_PORT: Joi.number().port().optional().description('Admin panel port'),
  API_PREFIX: Joi.string().default('api').optional().description('API prefix'),

  // CORS Configuration
  CORS_ORIGIN: Joi.string().optional().description('CORS origin'),
  CORS_CREDENTIALS: Joi.string()
    .valid('true', 'false')
    .optional()
    .description('CORS credentials'),

  // JWT Configuration
  JWT_SECRET: Joi.string().optional().description('JWT secret key'),
  JWT_REFRESH_SECRET: Joi.string().optional().description('JWT refresh secret key'),
  JWT_EXPIRES_IN: Joi.string().default('1h').description('JWT expiration time'),
  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default('7d')
    .description('JWT refresh expiration time'),

  // Redis/Cache Configuration
  REDIS_ENABLED: Joi.string()
    .valid('true', 'false')
    .default('false')
    .optional()
    .description('Enable Redis cache'),
  REDIS_HOST: Joi.string().hostname().default('localhost').optional().description('Redis host'),
  REDIS_PORT: Joi.number().port().default(6379).optional().description('Redis port'),
  REDIS_PASSWORD: Joi.string().allow('').optional().description('Redis password'),
  REDIS_TTL: Joi.number().integer().min(1).default(3600).optional().description('Redis TTL in seconds'),
  REDIS_DB: Joi.number().integer().min(0).default(0).optional().description('Redis database number'),
  REDIS_KEY_PREFIX: Joi.string().default('nestjs:').optional().description('Redis key prefix'),
  REDIS_MAX: Joi.number().integer().min(1).optional().description('Max items for in-memory cache'),

  // Swagger Configuration
  ENABLE_SWAGGER: Joi.string()
    .valid('true', 'false')
    .optional()
    .description('Enable Swagger documentation'),
  SWAGGER_PATH: Joi.string().default('api-docs').optional().description('Swagger path'),
  SWAGGER_TITLE: Joi.string().optional().description('Swagger title'),
  SWAGGER_DESCRIPTION: Joi.string().optional().description('Swagger description'),
  SWAGGER_VERSION: Joi.string().default('1.0').optional().description('Swagger version'),

  // Admin Configuration
  ADMIN_EMAIL: Joi.string().email().optional().description('Admin email'),
  ADMIN_PASSWORD: Joi.string().min(8).optional().description('Admin password'),
  ADMIN_ROLE: Joi.string().optional().description('Admin role'),
}).unknown(); // Allow unknown keys (for flexibility)

// Production schema (stricter validation)
const productionSchema = baseSchema.keys({
  NODE_ENV: Joi.string().valid('production').required(),
  DATABASE_URI: Joi.string().required().messages({
    'any.required': 'DATABASE_URI is required in production',
    'string.empty': 'DATABASE_URI cannot be empty in production',
  }),
  JWT_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_SECRET is required in production',
    'string.min': 'JWT_SECRET must be at least 32 characters in production',
  }),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_REFRESH_SECRET is required in production',
    'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters in production',
  }),
});

/**
 * Validates environment variables using Joi
 * 
 * @param config - Environment variables to validate
 * @returns Validated configuration object
 * @throws Error if validation fails
 */
export function validateEnv(config: Record<string, unknown>) {
  const nodeEnv = (config.NODE_ENV as string) || 'development';
  const schema = nodeEnv === 'production' ? productionSchema : baseSchema;

  const { error, value } = schema.validate(config, {
    abortEarly: false, // Show all errors
    stripUnknown: false, // Keep unknown keys
    convert: true, // Convert types automatically
  });

  if (error) {
    const errorMessages = error.details
      .map((detail) => {
        const path = detail.path.join('.');
        return `${path}: ${detail.message}`;
      })
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${errorMessages}\n\n` +
        `Please check your .env file and ensure all required variables are set correctly.\n` +
        `See .env.example for reference.`,
    );
  }

  return value;
}

/**
 * Validates environment variables based on NODE_ENV with fail-fast behavior
 * 
 * In production, more strict validation is applied.
 * This function should be called before application startup.
 * 
 * @param env - Environment variables to validate
 * @returns Validated configuration object
 * @throws Error if validation fails (fail-fast)
 */
export function validateEnvByNodeEnv(env: Record<string, unknown>) {
  const nodeEnv = (env.NODE_ENV as string) || 'development';
  const logger = new Logger('EnvValidation');

  // Validate environment variables
  const validated = validateEnv(env);

  // Production-specific warnings
  if (nodeEnv === 'production') {
    const warnings: string[] = [];

    // Check for default/weak values
    if (validated.JWT_SECRET === 'your-secret-key-change-in-production') {
      warnings.push('JWT_SECRET is using default value - change this in production!');
    }
    if (validated.JWT_REFRESH_SECRET === 'your-refresh-secret-key') {
      warnings.push('JWT_REFRESH_SECRET is using default value - change this in production!');
    }
    if (validated.CORS_ORIGIN === '*') {
      warnings.push('CORS_ORIGIN is set to * (allows all origins) - consider restricting this');
    }
    if (!validated.REDIS_ENABLED || validated.REDIS_ENABLED === 'false') {
      warnings.push('Redis is disabled - consider enabling for production scalability');
    }

    if (warnings.length > 0) {
      logger.warn(
        `Production configuration warnings:\n${warnings.map((w) => `  - ${w}`).join('\n')}\n` +
          `Please review your environment configuration.`,
      );
    }
  }

  logger.log(`Environment validation passed (${nodeEnv})`);
  return validated;
}

/**
 * Joi Schema for ConfigModule
 * 
 * This schema is used by NestJS ConfigModule for fail-fast validation.
 * Import this in your AppModule:
 * 
 * ```typescript
 * ConfigModule.forRoot({
 *   validationSchema: getJoiValidationSchema(),
 * })
 * ```
 */
export function getJoiValidationSchema() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'production') {
    return productionSchema;
  }
  
  return baseSchema;
}
