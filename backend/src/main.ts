import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { LoggerService } from './common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get logger and config from app
  const logger = app.get(LoggerService);
  const configService = app.get(ConfigService);
  
  // Configure global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Add global exception filter to sanitize error responses
  const loggerService = app.get(LoggerService);
  app.useGlobalFilters(new HttpExceptionFilter(loggerService));
  
  // Get frontend URL from config for CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  logger.log(`Configuring CORS for frontend URL: ${frontendUrl}`);
  
  // Configure CORS
  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
  });
  
  // Use cookie parser
  app.use(cookieParser());
  
  // Setup Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('EBIZ-Saas API')
    .setDescription('API documentation for EBIZ-Saas backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Start the server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 