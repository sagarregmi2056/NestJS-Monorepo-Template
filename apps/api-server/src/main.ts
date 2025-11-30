import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@app/common';
import { setupSwagger } from '@app/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  const corsConfig = configService.get('app.cors');
  app.enableCors(corsConfig);

  // Swagger documentation (dev only, or if ENABLE_SWAGGER=true)
  setupSwagger(app);

  // Port priority: API_SERVER_PORT > PORT > 3001
  const port = parseInt(process.env.API_SERVER_PORT || process.env.PORT || '3001', 10);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📊 Environment: ${configService.get<string>('app.env')}`);
  console.log(`💾 Database: ${configService.get<string>('database.type')}`);
}

bootstrap();

