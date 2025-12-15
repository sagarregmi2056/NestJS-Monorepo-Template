import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, validateSync } from 'class-validator';
import { Logger } from '@nestjs/common';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  @IsNotEmpty()
  DATABASE_URI?: string;

  @IsString()
  @IsNotEmpty()
  DB_TYPE?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET?: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET?: string;
}

/**
 * Validates environment variables on application startup
 * 
 * Throws an error if required environment variables are missing or invalid.
 * 
 * Usage:
 * ```typescript
 * import { validateEnv } from '@app/configuration';
 * 
 * validateEnv(process.env);
 * ```
 */
export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const missingVars = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');

    throw new Error(
      `Environment validation failed:\n${missingVars}\n\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `See .env.example for reference.`,
    );
  }

  return validatedConfig;
}

/**
 * Validates environment variables based on NODE_ENV
 * 
 * In production, more strict validation is applied.
 */
export function validateEnvByNodeEnv(env: Record<string, unknown>) {
  const nodeEnv = env.NODE_ENV || 'development';

  // In production, require critical variables
  if (nodeEnv === 'production') {
    const requiredInProduction = [
      'DATABASE_URI',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
    ];

    const missing = requiredInProduction.filter(
      (key) => !env[key] || env[key] === '',
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables in production:\n` +
          `${missing.join(', ')}\n\n` +
          `These variables are required for production deployment.`,
      );
    }

    // Warn about default values in production
    const warnings = [];
    if (env.JWT_SECRET === 'your-secret-key-change-in-production') {
      warnings.push('JWT_SECRET is using default value');
    }
    if (env.JWT_REFRESH_SECRET === 'your-refresh-secret-key') {
      warnings.push('JWT_REFRESH_SECRET is using default value');
    }
    if (env.CORS_ORIGIN === '*') {
      warnings.push('CORS_ORIGIN is set to * (allow all origins)');
    }

    if (warnings.length > 0) {
      const logger = new Logger('EnvValidation');
      logger.warn(
        `Production warnings:\n${warnings.join('\n')}\n` +
          `Please review your environment configuration.`,
      );
    }
  }

  return validateEnv(env);
}

