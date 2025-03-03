import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

/**
 * VAT ID validation service
 * This service provides validation logic for VAT IDs across EU countries
 */
@Injectable()
export class VatValidator {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Validate a VAT ID based on its format and check digits
   * @param vatId VAT ID to validate (can be with or without country prefix)
   * @param countryCode ISO country code (2 letters)
   * @param isEuVat Whether this is an EU VAT ID
   * @returns Validation result with valid flag and optional message
   */
  async validateVat(
    vatId: string, 
    countryCode: string,
    isEuVat: boolean = false
  ): Promise<{ valid: boolean; message?: string }> {
    this.logger.debug(`Validating ${isEuVat ? 'EU' : 'local'} VAT ID: ${vatId} for country ${countryCode}`);

    // Normalize inputs
    vatId = vatId.toUpperCase().replace(/[^A-Z0-9]/g, '');
    countryCode = countryCode.toUpperCase();

    // For EU VAT ID, it must include country code
    if (isEuVat && (!vatId.startsWith(countryCode))) {
      return { 
        valid: false, 
        message: `EU VAT ID must start with country code ${countryCode}` 
      };
    }

    // If the VAT ID already includes the country code, extract it
    if (vatId.length >= 2 && /^[A-Z]{2}/.test(vatId)) {
      if (vatId.startsWith(countryCode)) {
        // For local VAT, remove country code if present
        if (!isEuVat) {
          vatId = vatId.substring(2);
          this.logger.debug(`Removed country prefix for local VAT validation: ${vatId}`);
        }
      } else {
        return { 
          valid: false, 
          message: `VAT ID starts with ${vatId.substring(0,2)} but country code is ${countryCode}` 
        };
      }
    } else if (isEuVat) {
      // EU VAT must have country prefix
      return {
        valid: false,
        message: `EU VAT ID must include country code ${countryCode}`
      };
    }

    // Check format based on country
    const formatValid = this.checkFormat(vatId, countryCode, isEuVat);
    if (!formatValid.valid) {
      return formatValid;
    }

    // Check control characters if the country supports it
    const vatForControl = isEuVat ? vatId.substring(2) : vatId;
    const controlValid = this.checkControlCharacters(vatForControl, countryCode);
    if (!controlValid.valid) {
      return controlValid;
    }

    // TODO: For EU VAT, validate against the VIES database
    // Currently, we only validate the format and control characters

    this.logger.debug(`${isEuVat ? 'EU' : 'Local'} VAT ID validation successful for ${vatId}`);
    return { valid: true };
  }

  /**
   * Check if the VAT number follows the correct format for the given country
   * @param vatNumber VAT number (with or without country code)
   * @param countryCode ISO country code
   * @param isEuVat Whether this is an EU VAT ID
   * @returns Validation result
   */
  private checkFormat(
    vatNumber: string, 
    countryCode: string, 
    isEuVat: boolean
  ): { valid: boolean; message?: string } {
    // Special case for Greece, which uses EL in VAT IDs but GR as country code
    if (countryCode === 'GR') {
      countryCode = 'EL';
    }

    // Regular expressions for VAT format validation by country
    const formatRules: Record<string, { regex: RegExp; description: string }> = {
      'AT': { regex: isEuVat ? /^AT[U]\d{8}$/ : /^[U]\d{8}$/, description: isEuVat ? 'AT + U + 8 digits' : 'U + 8 digits' },
      'BE': { regex: isEuVat ? /^BE\d{10}$/ : /^\d{10}$/, description: isEuVat ? 'BE + 10 digits' : '10 digits' },
      'BG': { regex: isEuVat ? /^BG\d{9,10}$/ : /^\d{9,10}$/, description: isEuVat ? 'BG + 9 or 10 digits' : '9 or 10 digits' },
      'CY': { regex: isEuVat ? /^CY\d{8}[A-Z]$/ : /^\d{8}[A-Z]$/, description: isEuVat ? 'CY + 8 digits + 1 letter' : '8 digits + 1 letter' },
      'CZ': { regex: isEuVat ? /^CZ\d{8,10}$/ : /^\d{8,10}$/, description: isEuVat ? 'CZ + 8, 9, or 10 digits' : '8, 9, or 10 digits' },
      'DE': { regex: isEuVat ? /^DE\d{9}$/ : /^\d{9}$/, description: isEuVat ? 'DE + 9 digits' : '9 digits' },
      'DK': { regex: isEuVat ? /^DK\d{8}$/ : /^\d{8}$/, description: isEuVat ? 'DK + 8 digits' : '8 digits' },
      'EE': { regex: isEuVat ? /^EE\d{9}$/ : /^\d{9}$/, description: isEuVat ? 'EE + 9 digits' : '9 digits' },
      'EL': { regex: isEuVat ? /^EL\d{9}$/ : /^\d{9}$/, description: isEuVat ? 'EL + 9 digits' : '9 digits' },
      'ES': { regex: isEuVat ? /^ES[A-Z0-9]\d{7}[A-Z0-9]$/ : /^[A-Z0-9]\d{7}[A-Z0-9]$/, description: isEuVat ? 'ES + 1 letter/digit + 7 digits + 1 letter/digit' : '1 letter/digit + 7 digits + 1 letter/digit' },
      'FI': { regex: isEuVat ? /^FI\d{8}$/ : /^\d{8}$/, description: isEuVat ? 'FI + 8 digits' : '8 digits' },
      'FR': { regex: isEuVat ? /^FR[A-Z0-9]{2}\d{9}$/ : /^[A-Z0-9]{2}\d{9}$/, description: isEuVat ? 'FR + 2 letters/digits + 9 digits' : '2 letters/digits + 9 digits' },
      'HR': { regex: isEuVat ? /^HR\d{11}$/ : /^\d{11}$/, description: isEuVat ? 'HR + 11 digits' : '11 digits' },
      'HU': { regex: isEuVat ? /^HU\d{8}$/ : /^\d{8}$/, description: isEuVat ? 'HU + 8 digits' : '8 digits' },
      'IE': { regex: isEuVat ? /^IE[0-9A-Z+*]{8,9}$/ : /^[0-9A-Z+*]{8,9}$/, description: isEuVat ? 'IE + 8 or 9 characters' : '8 or 9 characters' },
      'IT': { regex: isEuVat ? /^IT\d{11}$/ : /^\d{11}$/, description: isEuVat ? 'IT + 11 digits' : '11 digits' },
      'LT': { regex: isEuVat ? /^LT\d{9,12}$/ : /^\d{9,12}$/, description: isEuVat ? 'LT + 9 or 12 digits' : '9 or 12 digits' },
      'LU': { regex: isEuVat ? /^LU\d{8}$/ : /^\d{8}$/, description: isEuVat ? 'LU + 8 digits' : '8 digits' },
      'LV': { regex: isEuVat ? /^LV\d{11}$/ : /^\d{11}$/, description: isEuVat ? 'LV + 11 digits' : '11 digits' },
      'MT': { regex: isEuVat ? /^MT\d{8}$/ : /^\d{8}$/, description: isEuVat ? 'MT + 8 digits' : '8 digits' },
      'NL': { regex: isEuVat ? /^NL\d{9}B\d{2}$/ : /^\d{9}B\d{2}$/, description: isEuVat ? 'NL + 9 digits + B + 2 digits' : '9 digits + B + 2 digits' },
      'PL': { regex: isEuVat ? /^PL\d{10}$/ : /^\d{10}$/, description: isEuVat ? 'PL + 10 digits' : '10 digits' },
      'PT': { regex: isEuVat ? /^PT\d{9}$/ : /^\d{9}$/, description: isEuVat ? 'PT + 9 digits' : '9 digits' },
      'RO': { regex: isEuVat ? /^RO\d{2,10}$/ : /^\d{2,10}$/, description: isEuVat ? 'RO + 2-10 digits' : '2-10 digits' },
      'SE': { regex: isEuVat ? /^SE\d{12}$/ : /^\d{12}$/, description: isEuVat ? 'SE + 12 digits' : '12 digits' },
      'SI': { regex: isEuVat ? /^SI\d{8}$/ : /^\d{8}$/, description: isEuVat ? 'SI + 8 digits' : '8 digits' },
      'SK': { regex: isEuVat ? /^SK\d{10}$/ : /^\d{10}$/, description: isEuVat ? 'SK + 10 digits' : '10 digits' },
    };

    // Check if country is supported
    if (!formatRules[countryCode]) {
      return { valid: false, message: `Unsupported country code: ${countryCode}` };
    }

    // Check format
    const { regex, description } = formatRules[countryCode];
    if (!regex.test(vatNumber)) {
      return { 
        valid: false, 
        message: `Invalid format for ${countryCode} VAT number. Expected: ${description}` 
      };
    }

    return { valid: true };
  }

  /**
   * Check control characters/digits for VAT validation
   * @param vatNumber VAT number without country code
   * @param countryCode ISO country code
   * @returns Validation result
   */
  private checkControlCharacters(vatNumber: string, countryCode: string): { valid: boolean; message?: string } {
    // Only implement for a few countries as examples
    // In a production environment, you would implement all EU countries
    
    switch (countryCode) {
      case 'DE':
        return this.validateGermanVat(vatNumber);
      case 'AT':
        return this.validateAustrianVat(vatNumber);
      case 'FR':
        return this.validateFrenchVat(vatNumber);
      // Add more countries as needed
      default:
        // For countries without control character validation implemented,
        // return valid and log that we're skipping the check
        this.logger.debug(`Control character check not implemented for ${countryCode}, skipping`);
        return { valid: true, message: 'Control character check not implemented for this country' };
    }
  }

  /**
   * Validate German VAT ID control digit
   * @param vatNumber VAT number without country code (9 digits)
   * @returns Validation result
   */
  private validateGermanVat(vatNumber: string): { valid: boolean; message?: string } {
    // German VAT uses a complex product sum algorithm
    let sum = 0;
    let product = 10;
    
    for (let i = 0; i < 8; i++) {
      const digit = parseInt(vatNumber.charAt(i), 10);
      sum = (digit + product) % 10;
      if (sum === 0) sum = 10;
      product = (2 * sum) % 11;
    }
    
    const checkDigit = 11 - product;
    const lastDigit = parseInt(vatNumber.charAt(8), 10);
    
    if ((checkDigit === 10 && lastDigit === 0) || checkDigit === lastDigit) {
      return { valid: true };
    }
    
    return { 
      valid: false,
      message: 'Invalid control digits for German VAT number'
    };
  }

  /**
   * Validate Austrian VAT ID
   * @param vatNumber VAT number without country code
   * @returns Validation result
   */
  private validateAustrianVat(vatNumber: string): { valid: boolean; message?: string } {
    // Austrian VAT starts with U and has 8 digits, where the last is a check digit
    if (vatNumber.charAt(0) !== 'U') {
      return { valid: false, message: 'Austrian VAT number must start with U' };
    }
    
    const digits = vatNumber.substring(1);
    const lastDigit = parseInt(digits.charAt(7), 10);
    
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const digit = parseInt(digits.charAt(i), 10);
      sum += (i % 2 === 0) ? digit : (digit * 2) % 9;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    
    if (checkDigit === lastDigit) {
      return { valid: true };
    }
    
    return {
      valid: false,
      message: 'Invalid control digit for Austrian VAT number'
    };
  }

  /**
   * Validate French VAT ID
   * @param vatNumber VAT number without country code
   * @returns Validation result
   */
  private validateFrenchVat(vatNumber: string): { valid: boolean; message?: string } {
    // French VAT has 11 characters: 2 chars + 9 digits where the first 2 can be alphanumeric
    // The check algorithm is based on modulo 97
    const numeric = this.extractNumericPart(vatNumber);
    const remainder = parseInt(numeric, 10) % 97;
    
    if (remainder === 0) {
      return { valid: true };
    }
    
    return {
      valid: false,
      message: 'Invalid check value for French VAT number'
    };
  }

  /**
   * Extract the numeric part of a string
   * @param str String to process
   * @returns String with only numeric characters
   */
  private extractNumericPart(str: string): string {
    return str.replace(/[^0-9]/g, '');
  }
} 