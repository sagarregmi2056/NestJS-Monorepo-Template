import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@app/common';
import { setupSwagger } from '@app/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix for admin routes
  app.setGlobalPrefix('admin');

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

  // Port priority: ADMIN_PORT > PORT > 3003
  const port = parseInt(process.env.ADMIN_PORT || process.env.PORT || '3003', 10);
  await app.listen(port);

  console.log(`🚀 Admin panel is running on: http://localhost:${port}/admin`);
  console.log(`📊 Environment: ${configService.get<string>('app.env')}`);
  console.log(`💾 Database: ${configService.get<string>('database.type')}`);
}

bootstrap();

