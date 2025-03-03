import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompanyOnboardingDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Inc.',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Local VAT ID (without country prefix)',
    example: '12345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  vatId?: string;

  @ApiProperty({
    description: 'EU VAT ID with country prefix',
    example: 'DE123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  euVatId?: string;

  @ApiProperty({
    description: 'Local VAT ID for matching against bank statements',
    example: 'DE12345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  localVatId?: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Main St',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'Berlin',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Postal code',
    example: '10115',
    required: false,
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({
    description: 'Country code',
    example: 'DE',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'Industry',
    example: 'Software Development',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;
} 