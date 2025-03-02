Feature: Transaction Management
  As a user of EBIZ-Saas
  I want to view and filter my transaction data
  So that I can track financial activities and link them to documents

  Background:
    Given I am logged in to the EBIZ-Saas application
    And I have bank statements uploaded with transaction data
    And I have the following bank accounts in the system:
      | name              | iban                          | currency |
      | Business Account  | DE89 3704 0044 0532 0130 00   | EUR      |
      | USD Account       | DE27 3704 0044 0532 0130 01   | USD      |
    And I have navigated to the "Transactions" page

  Scenario: Viewing all transactions across bank accounts
    When I load the transactions page
    Then I should see a table of transactions
    And the table should include columns for Date, Description, Amount, Bank Account, Transaction Type, and Linked Document
    And transactions should be sorted by date with most recent first

  Scenario: Filtering transactions by date range
    When I open the date filter
    And I set the start date to "01/01/2023"
    And I set the end date to "31/01/2023"
    And I apply the filter
    Then I should only see transactions from January 2023
    And transactions outside this range should be hidden

  Scenario: Filtering transactions by bank account
    When I select "Business Account" from the bank account filter dropdown
    Then I should only see transactions from the "Business Account"
    And transactions from other accounts should be hidden

  Scenario: Filtering transactions by transaction type
    When I select "Credit" from the transaction type filter dropdown
    Then I should only see credit transactions
    And debit transactions should be hidden

  Scenario: Filtering transactions by amount range
    When I set the minimum amount to "1000"
    And I set the maximum amount to "5000"
    And I apply the amount filter
    Then I should only see transactions with amounts between 1000 and 5000
    And transactions outside this range should be hidden

  Scenario: Filtering transactions by vendor/customer
    When I enter "Supplier Ltd" in the vendor/customer search box
    Then I should only see transactions related to "Supplier Ltd"
    And transactions with other vendors/customers should be hidden

  Scenario: Viewing transactions grouped by vendor
    When I click on the "Group by Vendor" button
    Then I should see transactions grouped by vendor names
    And each vendor group should show the total transaction amount
    And I should be able to expand each group to see individual transactions

  Scenario: Viewing transactions grouped by customer
    When I click on the "Group by Customer" button
    Then I should see transactions grouped by customer names
    And each customer group should show the total transaction amount
    And I should be able to expand each group to see individual transactions

  Scenario: Linking a document to a transaction
    Given I have uploaded a document "invoice123.pdf"
    When I click on the "Link Document" button for transaction dated "2023-01-15"
    And I select "invoice123.pdf" from the document list
    And I click "Confirm"
    Then the transaction should show "invoice123.pdf" in the Linked Document column
    And I should be able to click on the document name to view it
    And the transaction_id field in the documents table should be updated with this transaction's ID

  Scenario: Viewing transaction details
    When I click on a transaction in the transaction list
    Then I should see a modal with detailed transaction information
    And I should see the full transaction description
    And I should see any linked documents
    And I should have the option to close the modal

  Scenario: Viewing multi-currency transactions
    Given I have transactions in multiple currencies:
      | amount  | currency | bank_account | credit_debit | booking_date | description         |
      | 1000.00 | EUR      | Business Account | CREDIT   | 2023-01-05   | Invoice payment     |
      | 500.00  | USD      | USD Account  | DEBIT        | 2023-01-10   | Software purchase   |
    When I load the transactions page
    Then I should see the transactions with their respective currency symbols
    And I should see a total balance for each currency
    And I should have an option to view all amounts in a primary currency with conversion rates

  Scenario: Automated transaction categorization
    Given I have the following uncategorized transactions:
      | amount  | description                    | credit_debit |
      | 1200.00 | PAYMENT TO OFFICE SUPPLIES CO | DEBIT        |
      | 35.00   | COFFEE SHOP PURCHASE          | DEBIT        |
      | 750.00  | MONTHLY RENT PAYMENT          | DEBIT        |
    When the system processes these transactions
    Then they should be automatically categorized as:
      | description                    | category        |
      | PAYMENT TO OFFICE SUPPLIES CO | Office Supplies |
      | COFFEE SHOP PURCHASE          | Food & Drinks   |
      | MONTHLY RENT PAYMENT          | Rent            |
    And I should be able to see and edit these categories in the transaction list

  Scenario: Transaction data export
    When I click on the "Export Transactions" button
    And I select format "CSV"
    And I select date range from "01/01/2023" to "31/01/2023"
    And I click "Export"
    Then I should receive a CSV file containing all matching transactions
    And the file should include all transaction details including amounts, dates, and categories

  Scenario: Handling failed transaction parsing
    Given a bank statement with a transaction that fails to parse correctly
    When I view the transactions page
    Then I should see an alert for transactions with parsing issues
    And I should be able to manually edit and correct the transaction data 