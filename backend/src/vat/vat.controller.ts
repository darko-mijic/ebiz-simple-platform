import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VatService } from './vat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('VAT')
@Controller('vat')
export class VatController {
  constructor(
    private readonly vatService: VatService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({ summary: 'Validate a VAT ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'VAT ID validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        message: { type: 'string' },
        vatDetails: {
          type: 'object',
          properties: {
            countryCode: { type: 'string' },
            vatNumber: { type: 'string' },
            isEuVat: { type: 'boolean' },
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'vatId', required: true, description: 'VAT ID to validate (with or without country prefix)' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'ISO country code (2 letters)' })
  @ApiQuery({ name: 'isEuVat', required: false, description: 'Whether this is an EU VAT ID (true/false)' })
  @Get('validate')
  async validateVat(
    @Query('vatId') vatId: string,
    @Query('countryCode') countryCode?: string,
    @Query('isEuVat') isEuVatQuery?: string,
  ) {
    const isEuVat = isEuVatQuery?.toLowerCase() === 'true';
    
    this.logger.log(`Validating ${isEuVat ? 'EU' : 'local'} VAT ID: ${vatId}`);
    
    try {
      const result = await this.vatService.validateVat(vatId, countryCode, isEuVat);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error validating VAT ID: ${errorMessage}`);
      return {
        valid: false,
        message: 'Error during VAT validation',
      };
    }
  }
} 