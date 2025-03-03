import { Module } from '@nestjs/common';
import { VatValidator } from './vat.validator';
import { LoggerModule } from '../logger/logger.module';

/**
 * Module providing validation utilities for various business objects
 * 
 * TODO: Consider moving validators to @libs directory for cross-package reuse
 * This would allow sharing validation logic between backend, frontend, and other packages
 */
@Module({
  imports: [LoggerModule],
  providers: [VatValidator],
  exports: [VatValidator],
})
export class ValidatorsModule {} 