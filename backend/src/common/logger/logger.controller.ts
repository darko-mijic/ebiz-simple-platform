import { Controller, Post, Body } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Logging')
@Controller('client-logs')
export class ClientLoggerController {
  constructor(private readonly logger: LoggerService) {}

  @ApiOperation({ summary: 'Store client-side logs' })
  @Post()
  clientLog(@Body() logData: any) {
    this.logger.log(`[Client] ${logData.message}`, 'ClientLogger', logData.meta);
    return { received: true };
  }
} 