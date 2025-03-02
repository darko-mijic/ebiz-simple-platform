Feature: Dashboard
  As a user of EBIZ-Saas
  I want to see an overview of my financial information
  So that I can quickly understand my current financial status

  Background:
    Given I am logged in to the EBIZ-Saas application
    And I have bank statements and transactions in the system
    And I have navigated to the "Dashboard" page

  Scenario: Viewing total balance
    Then I should see the total balance across all bank accounts
    And the balance should be clearly displayed in a prominent position
    And the balance should be formatted with the appropriate currency symbol

  Scenario: Viewing recent transactions
    Then I should see a list of the 10 most recent transactions
    And each transaction should display the date, description, and amount
    And transactions should be sorted by date with the most recent first
    And the transactions should be fetched from the transactions table in the database

  Scenario: Viewing recent documents
    Given I have uploaded at least one document
    Then I should see a list of the 10 most recent documents
    And each document should display the filename, upload date, and status
    And documents should be sorted by upload date with the most recent first

  Scenario: Viewing documents needing attention
    Given I have uploaded documents with recognition issues
    Then I should see a section highlighting documents needing attention
    And each document should display the filename and the specific issue
    And there should be a "Resolve" button for each document

  Scenario: Navigating to transaction details from dashboard
    When I click on a transaction in the recent transactions list
    Then I should be taken to the transaction details view
    And I should see the full details of the selected transaction

  Scenario: Navigating to document details from dashboard
    When I click on a document in the recent documents list
    Then I should be taken to the document details view
    And I should see the full details of the selected document

  Scenario: Viewing bank account distribution
    Given I have multiple bank accounts
    Then I should see a visual representation of my balance distribution across accounts
    And each account should be represented with a different color or section
    And I should see the name and amount for each account

  Scenario: Expanding collapsed sidebar from dashboard
    Given the navigation sidebar is collapsed
    When I click on the expand button
    Then the sidebar should expand to show all navigation options with text labels
    And the main dashboard content should adjust to accommodate the expanded sidebar

  Scenario: Collapsing expanded sidebar from dashboard
    Given the navigation sidebar is expanded
    When I click on the collapse button
    Then the sidebar should collapse to show only icons
    And the main dashboard content should expand to use the available space

  Scenario: Accessing quick actions from dashboard
    Then I should see quick action buttons for common tasks
    And the quick actions should include "Upload Statement" and "Upload Document"
    And clicking a quick action should take me to the appropriate page

  Scenario: Dashboard data refresh
    Given I am viewing the dashboard
    When a new transaction is added to the database
    And I click the "Refresh" button
    Then I should see the updated transaction in the recent transactions list
    And the total balance should be recalculated to include the new transaction

  Scenario: Dashboard automatic data refresh
    Given I am viewing the dashboard
    When a new transaction is added to the database
    And 60 seconds pass
    Then I should see the updated transaction in the recent transactions list without manual refresh
    And the total balance should be automatically recalculated

  Scenario: Handling data loading errors
    Given there is a problem connecting to the database
    When I load the dashboard
    Then I should see error indicators in the affected dashboard sections
    And each error indicator should include a "Retry" button
    When I click the "Retry" button
    Then the system should attempt to reload the data for that section

  Scenario: Dashboard with no data
    Given I am a new user with no transactions or documents
    When I view the dashboard
    Then I should see appropriate empty state messages
    And I should see guidance on how to add my first bank statement
    And I should see a prominent "Get Started" button 