Feature: Bank Statement Management
  As a user of EBIZ-Saas
  I want to upload and manage bank statements
  So that I can track my financial transactions

  Background:
    Given I am logged in to the EBIZ-Saas application
    And I have navigated to the "Bank Statements" page
    And I have the following bank accounts in the system:
      | name              | iban                          | currency |
      | Business Account  | DE89 3704 0044 0532 0130 00   | EUR      |
      | Savings Account   | DE27 3704 0044 0532 0130 01   | EUR      |

  Scenario: Uploading a valid SEPA CAMT ISO bank statement
    When I click on the "Upload Statement" button
    And I select a valid SEPA CAMT ISO file "statement_2023_01.xml"
    And I select "Business Account" from the bank account dropdown
    And I click "Upload"
    Then I should see a success message
    And the statement "statement_2023_01.xml" should appear in the statements list
    And the statement status should be "Parsed"
    And the following data should be saved to the database:
      | Field            | Value                           |
      | bank_account_id  | {id of Business Account}        |
      | sequence_number  | 1                               |
      | from_date        | 2023-01-01                      |
      | to_date          | 2023-01-31                      |

  Scenario: Attempting to upload a duplicate bank statement
    Given I have already uploaded statement "statement_2023_01.xml" for "Business Account"
    When I click on the "Upload Statement" button
    And I select the same file "statement_2023_01.xml"
    And I select "Business Account" from the bank account dropdown
    And I click "Upload"
    Then I should see an error message indicating the statement has already been uploaded
    And no duplicate entry should be created in the database

  Scenario: Attempting to upload an invalid file format
    When I click on the "Upload Statement" button
    And I select an invalid file "statement.pdf"
    And I click "Upload"
    Then I should see an error message indicating invalid file format
    And no new statement should be added to the statements list

  Scenario: Detecting gaps in sequential statement numbering
    Given I have previously uploaded statements with the following sequence numbers for 2023:
      | Bank Account     | Sequence Numbers |
      | Business Account | 1, 2, 4          |
    When I view the bank statements list
    Then I should see a warning indicator next to the sequence
    And the warning should indicate a missing statement number 3

  Scenario: Viewing bank statement details with parsed transactions
    Given I have uploaded statement "statement_2023_01.xml" with the following transactions:
      | amount  | currency | credit_debit | booking_date | value_date | remittance_info           |
      | 1000.00 | EUR      | CREDIT       | 2023-01-05   | 2023-01-06 | Invoice payment #INV-001  |
      | 250.50  | EUR      | DEBIT        | 2023-01-10   | 2023-01-10 | Office supplies           |
    When I click on the statement "statement_2023_01.xml" in the list
    Then I should see detailed information about the statement
    And I should see a summary showing 1 credit transaction totaling €1000.00
    And I should see a summary showing 1 debit transaction totaling €250.50
    And I should see a list of all 2 transactions in the statement

  Scenario: Filtering bank statements by date range
    Given I have uploaded statements from different time periods:
      | statement_file           | from_date  | to_date    |
      | statement_2023_Q1_1.xml  | 2023-01-01 | 2023-01-31 |
      | statement_2023_Q1_2.xml  | 2023-02-01 | 2023-02-28 |
      | statement_2023_Q1_3.xml  | 2023-03-01 | 2023-03-31 |
      | statement_2023_Q2_1.xml  | 2023-04-01 | 2023-04-30 |
    When I set the date filter from "01/01/2023" to "31/03/2023"
    Then I should see only statements from Q1 2023
    And statements from other periods should be hidden

  Scenario: Filtering bank statements by bank account
    Given I have uploaded statements from multiple bank accounts
    When I select bank account "Business Account" from the filter dropdown
    Then I should see only statements from the "Business Account"
    And statements from other accounts should be hidden

  Scenario: Validating parsed transaction data
    Given I have uploaded a bank statement "statement_2023_01.xml"
    When I view the statement details
    Then the system should display any transactions with validation issues
    And for each transaction, I should see the following data correctly parsed:
      | Field           | Example Value               |
      | amount          | 1000.00                     |
      | currency        | EUR                         |
      | credit_debit    | CREDIT                      |
      | booking_date    | 2023-01-05                  |
      | value_date      | 2023-01-06                  |
      | references      | {"ref": "RF18539007547034"} |
      | related_parties | {"name": "Acme Inc"}        |

  Scenario: Deleting a bank statement
    Given I have at least one bank statement uploaded
    When I click the delete icon next to statement "statement_2023_01.xml"
    And I confirm the deletion in the confirmation dialog
    Then the statement "statement_2023_01.xml" should be removed from the list
    And related transactions should be removed from the system
    And the statement record should be deleted from the database 