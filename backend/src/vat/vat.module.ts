import { Module } from '@nestjs/common';
import { VatController } from './vat.controller';
import { VatService } from './vat.service';
import { ValidatorsModule } from '../common/validators/validators.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [ValidatorsModule, LoggerModule],
  controllers: [VatController],
  providers: [VatService],
  exports: [VatService],
})
export class VatModule {} 