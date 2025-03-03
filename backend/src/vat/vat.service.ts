import { Injectable } from '@nestjs/common';
import { VatValidator } from '../common/validators/vat.validator';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class VatService {
  constructor(
    private readonly vatValidator: VatValidator,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Validate a VAT ID
   * @param vatId VAT ID to validate
   * @param countryCode ISO country code (optional if included in vatId)
   * @param isEuVat Whether this is an EU VAT ID (default: false)
   * @returns Validation result with details
   */
  async validateVat(
    vatId: string, 
    countryCode?: string,
    isEuVat: boolean = false
  ): Promise<any> {
    this.logger.debug(`VAT validation request for ${isEuVat ? 'EU' : 'local'} VAT ID`);

    // If vatId is empty, return invalid
    if (!vatId) {
      return {
        valid: false,
        message: 'VAT ID is required',
      };
    }

    // Clean the VAT ID
    vatId = vatId.replace(/[.\s-]/g, '').toUpperCase();

    // Extract country code from VAT ID if not provided
    if (!countryCode && vatId.length >= 2 && /^[A-Z]{2}/.test(vatId)) {
      countryCode = vatId.substring(0, 2);
      this.logger.debug(`Extracted country code ${countryCode} from VAT ID`);
    }

    // Validate the VAT ID
    if (!countryCode) {
      return {
        valid: false,
        message: 'Country code is required for VAT validation',
      };
    }

    try {
      const result = await this.vatValidator.validateVat(vatId, countryCode, isEuVat);

      // If valid, add some VAT details
      if (result.valid) {
        // Extract VAT number (remove country code if present for display purposes)
        let vatNumber = vatId;
        if (isEuVat && vatId.startsWith(countryCode)) {
          vatNumber = vatId.substring(2);
        }

        // In a real implementation, we would get company details from the VIES service
        // For now, we'll just return placeholder data
        return {
          ...result,
          vatDetails: {
            countryCode,
            vatNumber,
            isEuVat,
            name: 'ACME Corporation', // This would come from VIES in production
            address: '123 Business Street, Business City', // This would come from VIES in production
          },
        };
      }

      return result;
    } catch (error) {
      this.logger.error(`Error during ${isEuVat ? 'EU' : 'local'} VAT validation`);
      
      return {
        valid: false,
        message: 'Error during VAT validation',
      };
    }
  }
} 