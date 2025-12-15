import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS
  const corsConfig = configService.get('app.cors');
  app.enableCors(corsConfig);

  // Port priority: WEBSOCKET_PORT > PORT > 3001
  const port = parseInt(process.env.WEBSOCKET_PORT || process.env.PORT || '3001', 10);
  await app.listen(port);

  logger.log(`WebSocket service is running on: http://localhost:${port}`);
  logger.log(`WebSocket gateway available at: ws://localhost:${port}`);
}

bootstrap();

