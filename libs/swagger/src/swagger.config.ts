import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Swagger Configuration
 * 
 * Single plugin approach - simple and reusable.
 * Automatically configures Swagger for both dev and prod environments.
 * 
 * Usage:
 * ```typescript
 * import { setupSwagger } from '@app/swagger';
 * 
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *   setupSwagger(app);
 *   await app.listen(3000);
 * }
 * ```
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'NestJS API')
    .setDescription(process.env.SWAGGER_DESCRIPTION || 'API Documentation')
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('health', 'Health check endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('admin', 'Admin endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Swagger path - configurable via environment
  const swaggerPath = process.env.SWAGGER_PATH || 'api-docs';
  
  // Only enable Swagger in development or if explicitly enabled
  const isSwaggerEnabled = 
    process.env.NODE_ENV === 'development' || 
    process.env.ENABLE_SWAGGER === 'true';

  if (isSwaggerEnabled) {
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Keep auth token in browser
        tagsSorter: 'alpha', // Sort tags alphabetically
        operationsSorter: 'alpha', // Sort operations alphabetically
      },
      customSiteTitle: process.env.SWAGGER_TITLE || 'API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
      `,
    });

    console.log(`📚 Swagger documentation available at: http://localhost:${process.env.PORT || 3000}/${swaggerPath}`);
  } else {
    console.log('📚 Swagger is disabled in production. Set ENABLE_SWAGGER=true to enable.');
  }
}

