Feature: Document Management
  As a user of EBIZ-Saas
  I want to upload and manage financial documents
  So that I can link them to transactions and extract data

  Background:
    Given I am logged in to the EBIZ-Saas application
    And I have navigated to the "Documents" page

  Scenario: Uploading a valid PDF document
    When I click on the "Upload Document" button
    And I select a valid PDF file "invoice.pdf"
    And I click "Upload"
    Then I should see a success message
    And the document "invoice.pdf" should appear in the documents list
    And the system should attempt to parse the document data
    And the following data should be stored in the database:
      | Field       | Value                |
      | company_id  | {my company id}      |
      | file_path   | /uploads/invoice.pdf |
      | upload_date | {current date}       |

  Scenario: Attempting to upload an unsupported file format
    When I click on the "Upload Document" button
    And I select an unsupported file "document.docx"
    And I click "Upload"
    Then I should see an error message indicating unsupported file format
    And no new document should be added to the documents list

  Scenario: Viewing document details
    Given I have uploaded a document "invoice.pdf"
    When I click on "invoice.pdf" in the documents list
    Then I should see a document preview
    And I should see extracted data from the document
    And I should see any linked transactions

  Scenario: Linking a document to a transaction
    Given I have uploaded a document "invoice.pdf"
    And I have transactions in the system
    When I view the document "invoice.pdf"
    And I click "Link to Transaction"
    And I select a transaction from the dropdown
    And I click "Confirm"
    Then the document should show the linked transaction
    And I should see a success message
    And the transaction_id field in the document record should be updated in the database

  Scenario: Automatically recognizing invoice data
    When I upload an invoice document "supplier_invoice.pdf"
    Then the system should extract and display:
      | Field            | Value           |
      | Invoice Number   | INV-12345       |
      | Invoice Date     | 15/01/2023      |
      | Supplier Name    | Acme Supplies   |
      | Total Amount     | €1,250.00       |
      | VAT Amount       | €250.00         |
    And the extracted data should be saved in the parsed_data JSON field in the database

  Scenario: Manually correcting unrecognized document data
    Given I have uploaded a document with partially recognized data
    When I view the document details
    And I edit the unrecognized field "Invoice Number"
    And I enter "INV-9876"
    And I save the changes
    Then the document should display "INV-9876" as the Invoice Number
    And the changes should be saved in the system

  Scenario: Handling document parsing errors
    Given I upload a document "damaged_invoice.pdf" that cannot be parsed properly
    Then I should see a warning message indicating parsing issues
    And I should see a form allowing me to manually enter the document data
    When I fill in the missing data fields
    And I save the changes
    Then the document should be stored with my manually entered data
    And the parsing_error flag should be set in the document's metadata

  Scenario: Recovery from OCR failures
    Given I have uploaded a document with OCR recognition failures
    When I view the document details
    Then I should see highlighted areas that failed OCR recognition
    And I should be able to manually correct each highlighted field
    When I correct all fields and save
    Then the document should be marked as successfully processed

  Scenario: Uploading a new version of an existing document
    Given I have uploaded document "invoice_v1.pdf"
    When I click on the "Upload New Version" button for this document
    And I select file "invoice_v2.pdf"
    And I click "Upload"
    Then I should see both versions in the document history
    And the most recent version should be displayed by default
    And I should be able to switch between versions

  Scenario: Filtering documents by date range
    Given I have uploaded documents from different dates
    When I set the document date filter from "01/01/2023" to "31/01/2023"
    Then I should only see documents from January 2023
    And documents from other periods should be hidden

  Scenario: Filtering documents by document type
    Given I have uploaded various document types
    When I select "Invoice" from the document type filter
    Then I should only see invoice documents
    And other document types should be hidden

  Scenario: Searching for documents by content
    Given I have uploaded multiple documents with different content
    When I enter "electricity bill" in the search box
    Then I should see only documents containing "electricity bill" in their content or metadata
    And other documents should be hidden

  Scenario: Bulk linking documents to transactions
    Given I have multiple unlinked documents
    When I select 3 documents from the list
    And I click "Bulk Link to Transactions"
    And I select the option to match by date and amount
    Then the system should automatically link each document to matching transactions
    And I should see a summary of successful and failed matches

  Scenario: Deleting a document
    Given I have at least one document uploaded
    When I click the delete icon next to document "invoice.pdf"
    And I confirm the deletion in the confirmation dialog
    Then the document "invoice.pdf" should be removed from the list
    And any transaction links to this document should be updated
    And the document record should be removed from the database 