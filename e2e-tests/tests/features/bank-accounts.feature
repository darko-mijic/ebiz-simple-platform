Feature: Bank Account Management
  As a user of EBIZ-Saas
  I want to manage my bank accounts
  So that I can track financial activities across multiple accounts

  Background:
    Given I am logged in to the EBIZ-Saas application
    And I have navigated to the "Bank Accounts" page

  Scenario: Adding a new bank account
    When I click on the "Add Bank Account" button
    Then I should see a form to add a new bank account
    When I enter "Business Checking" as the account name
    And I enter "DE89 3704 0044 0532 0130 00" as the IBAN
    And I enter "My Business Bank" as the bank name
    And I select "EUR" as the currency
    And I click "Save"
    Then I should see a success message
    And the account "Business Checking" should appear in the bank accounts list
    And the following data should be stored in the database:
      | Field       | Value                        |
      | company_id  | {my company id}              |
      | name        | Business Checking            |
      | iban        | DE89 3704 0044 0532 0130 00  |
      | currency    | EUR                          |

  Scenario: Country-specific IBAN validation
    When I click on the "Add Bank Account" button
    And I enter "French Account" as the account name
    And I enter "FR14 2004 1010 0505 0001 3M02 606" as the IBAN
    And I enter "French Bank" as the bank name
    And I select "EUR" as the currency
    And I click "Save"
    Then I should see a success message
    And the French IBAN should be validated according to French IBAN rules

  Scenario: Attempting to add a bank account with invalid IBAN
    When I click on the "Add Bank Account" button
    And I enter "Business Checking" as the account name
    And I enter "INVALID-IBAN" as the IBAN
    And I enter "My Business Bank" as the bank name
    And I select "EUR" as the currency
    And I click "Save"
    Then I should see an error message about invalid IBAN format
    And the account should not be added to the bank accounts list

  Scenario: Viewing bank account details
    Given I have added a bank account "Business Checking"
    When I click on "Business Checking" in the bank accounts list
    Then I should see the account details including:
      | Field          | Value                        |
      | Account Name   | Business Checking            |
      | IBAN           | DE89 3704 0044 0532 0130 00  |
      | Bank Name      | My Business Bank             |
      | Currency       | EUR                          |
      | Current Balance| Calculated from transactions |

  Scenario: Editing bank account details
    Given I have added a bank account "Business Checking"
    When I click on the edit icon for "Business Checking"
    And I change the account name to "Main Business Account"
    And I click "Save"
    Then I should see a success message
    And the account name should be updated to "Main Business Account" in the list
    And the name field should be updated in the bank_accounts table

  Scenario: Deleting a bank account
    Given I have added a bank account "Business Checking"
    When I click on the delete icon for "Business Checking"
    Then I should see a confirmation dialog
    When I confirm the deletion
    Then I should see a success message
    And "Business Checking" should be removed from the bank accounts list
    And the bank account record should be deleted from the database

  Scenario: Viewing bank account transaction history
    Given I have added a bank account "Business Checking"
    And I have uploaded statements for this account
    When I click on "Business Checking" in the bank accounts list
    And I click on the "Transactions" tab
    Then I should see a list of transactions for "Business Checking"
    And the transactions should be sorted by date with most recent first
    And all transactions shown should have the bank_account_id matching this account

  Scenario: Viewing bank account statements
    Given I have added a bank account "Business Checking"
    And I have uploaded statements for this account
    When I click on "Business Checking" in the bank accounts list
    And I click on the "Statements" tab
    Then I should see a list of uploaded statements for "Business Checking"
    And the statements should be sorted by date with most recent first

  Scenario: Managing multi-currency accounts
    Given I have the following bank accounts:
      | name                | iban                          | currency |
      | Euro Account        | DE89 3704 0044 0532 0130 00   | EUR      |
      | US Dollar Account   | DE27 3704 0044 0532 0130 01   | USD      |
      | British Pound Account| GB29 NWBK 6016 1331 9268 19  | GBP      |
    When I view the bank accounts page
    Then I should see all accounts with their respective currencies
    And I should see the balance for each account in its native currency
    And I should see a consolidated total converted to my primary currency

  Scenario: Filtering accounts by currency
    Given I have added accounts with different currencies
    When I select "EUR" from the currency filter dropdown
    Then I should see only accounts with EUR currency
    And accounts with other currencies should be hidden

  Scenario: Bank account balance history
    Given I have a bank account with multiple statements over time
    When I click on the "Balance History" tab for this account
    Then I should see a graph showing the account balance over time
    And I should see key data points marked on the graph
    And I should be able to hover over points to see detailed information 