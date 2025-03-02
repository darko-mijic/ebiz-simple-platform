import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { LoggerService } from './common/logger/logger.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get logger and config from app
  const logger = app.get(LoggerService);
  const configService = app.get(ConfigService);
  
  // Parse cookies in requests
  app.use(cookieParser());
  
  // Configure validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Get frontend URL from config for CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  
  // Enable CORS with credentials support for frontend
  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });
  
  // Setup Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('Ebiz SaaS API')
    .setDescription('API Documentation for the Ebiz SaaS platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // Start the server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 