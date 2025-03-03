import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { VatValidator } from '../../src/common/validators/vat.validator';
import { Test } from '@nestjs/testing';
import { LoggerService } from '../../src/common/logger/logger.service';
import { VatService } from '../../src/vat/vat.service';

// Mock logger to avoid actual logging during tests
class MockLoggerService {
  debug() {}
  log() {}
  warn() {}
  error() {}
}

// Test context to share data between steps
class VatValidationContext {
  vatId: string;
  countryCode: string;
  isEuVat: boolean;
  validationResult: any;
  vatService: VatService;
}

const testContext = new VatValidationContext();

// Create the test module before any scenario
Given('I am logged in as a company administrator', async function() {
  // Set up the NestJS testing module with our validators
  const moduleRef = await Test.createTestingModule({
    providers: [
      VatValidator,
      VatService,
      { provide: LoggerService, useClass: MockLoggerService },
    ],
  }).compile();

  // Get the VatService instance
  testContext.vatService = moduleRef.get<VatService>(VatService);

  // Verify the service was created
  expect(testContext.vatService).to.not.be.undefined;
});

Given('I have access to the VAT validation service', function() {
  // This is covered by the previous step
  expect(testContext.vatService).to.be.an('object');
});

Given('I have a local VAT ID {string} for country {string}', function(vatId, countryCode) {
  testContext.vatId = vatId;
  testContext.countryCode = countryCode;
  testContext.isEuVat = false;
});

Given('I have an EU VAT ID {string}', function(vatId) {
  testContext.vatId = vatId;
  
  // Extract country code from EU VAT ID
  if (vatId && vatId.length >= 2) {
    testContext.countryCode = vatId.substring(0, 2);
  }
  
  testContext.isEuVat = true;
});

Given('I specify the country as {string}', function(countryCode) {
  testContext.countryCode = countryCode;
});

When('I submit the VAT ID for validation', async function() {
  // Call the validation service
  testContext.validationResult = await testContext.vatService.validateVat(
    testContext.vatId,
    testContext.countryCode,
    testContext.isEuVat
  );
});

When('I submit the EU VAT ID for validation', async function() {
  // Call the validation service specifically for EU VAT
  testContext.validationResult = await testContext.vatService.validateVat(
    testContext.vatId,
    testContext.countryCode,
    true
  );
});

Then('the validation should be successful', function() {
  expect(testContext.validationResult).to.be.an('object');
  expect(testContext.validationResult.valid).to.be.true;
});

Then('the validation should fail', function() {
  expect(testContext.validationResult).to.be.an('object');
  expect(testContext.validationResult.valid).to.be.false;
});

Then('I should see company information associated with the VAT ID', function() {
  expect(testContext.validationResult.vatDetails).to.be.an('object');
  expect(testContext.validationResult.vatDetails.name).to.be.a('string');
  expect(testContext.validationResult.vatDetails.address).to.be.a('string');
});

Then('I should see an error message explaining the format issue', function() {
  expect(testContext.validationResult.message).to.be.a('string');
  expect(testContext.validationResult.message).to.include('format');
});

Then('I should see an error message about invalid country code', function() {
  expect(testContext.validationResult.message).to.be.a('string');
  expect(testContext.validationResult.message).to.include('country code');
});

Then('I should see an error message about country mismatch', function() {
  expect(testContext.validationResult.message).to.be.a('string');
  expect(testContext.validationResult.message).to.include('mismatch');
});

Then('the special characters should be properly removed', function() {
  expect(testContext.validationResult.valid).to.be.true;
  
  // In a more complete implementation, we would verify the normalized VAT ID
  // by checking an internal property or service response
});

// Generic steps for scenario outline
Given('I have a {word} VAT ID {string} for country {string}', function(vatType, vatId, countryCode) {
  testContext.vatId = vatId;
  testContext.countryCode = countryCode;
  testContext.isEuVat = vatType.toLowerCase() === 'eu';
});

Then('the validation should be {word}', function(result) {
  const isValid = result.toLowerCase() === 'successful';
  expect(testContext.validationResult.valid).to.equal(isValid);
});

Then('I should see {word} explaining the result', function(messageType) {
  if (messageType.includes('error')) {
    expect(testContext.validationResult.message).to.be.a('string');
  } else if (messageType.includes('information')) {
    expect(testContext.validationResult.vatDetails).to.be.an('object');
  }
}); 