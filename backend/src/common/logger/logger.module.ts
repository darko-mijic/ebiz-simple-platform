import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { ClientLoggerController } from './logger.controller';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
  controllers: [ClientLoggerController],
})
export class LoggerModule {} 