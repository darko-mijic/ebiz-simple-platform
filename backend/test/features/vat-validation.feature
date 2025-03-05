Feature: VAT ID Validation
  As a business user
  I want to validate VAT IDs
  So that I can ensure customer and vendor tax information is correct

  Background:
    Given I am logged in as a company administrator
    And I have access to the VAT validation service

  Scenario: Validating a valid local VAT ID
    Given I have a local VAT ID "123456789" for country "DE"
    When I submit the VAT ID for validation
    Then the validation should be successful
    And I should see company information associated with the VAT ID

  Scenario: Validating an invalid local VAT ID
    Given I have a local VAT ID "INVALID12345" for country "DE"
    When I submit the VAT ID for validation
    Then the validation should fail
    And I should see an error message explaining the format issue

  Scenario: Validating a valid EU VAT ID
    Given I have an EU VAT ID "DE123456789"
    When I submit the EU VAT ID for validation
    Then the validation should be successful
    And I should see company information associated with the VAT ID

  Scenario: Validating an EU VAT ID with invalid country prefix
    Given I have an EU VAT ID "XX123456789"
    When I submit the EU VAT ID for validation
    Then the validation should fail
    And I should see an error message about invalid country code

  Scenario: Validating an EU VAT ID with mismatched country code
    Given I have an EU VAT ID "FR12345678901"
    And I specify the country as "DE"
    When I submit the EU VAT ID for validation
    Then the validation should fail
    And I should see an error message about country mismatch

  Scenario: Validating a local VAT ID with special characters
    Given I have a local VAT ID "123 456.789" for country "DE"
    When I submit the VAT ID for validation
    Then the validation should be successful
    And the special characters should be properly removed

  Scenario Outline: Validating VAT IDs for different EU countries
    Given I have a <vat_type> VAT ID "<vat_id>" for country "<country_code>"
    When I submit the VAT ID for validation
    Then the validation should be <result>
    And I should see <message_type> explaining the result

    Examples:
      | vat_type | vat_id         | country_code | result      | message_type        |
      | local    | 123456789      | DE           | successful  | company information |
      | local    | U12345678      | AT           | successful  | company information |
      | EU       | FR12345678901  | FR           | successful  | company information |
      | EU       | DEABCDEF       | DE           | failed      | an error message    |
      | local    | 123            | DE           | failed      | an error message    |
      | EU       | IT12345678901  | IT           | successful  | company information | 