Feature: Chat Interface
  As a user of EBIZ-Saas
  I want to interact with my financial data using natural language
  So that I can quickly find information without navigating complex menus

  Background:
    Given I am logged in to the EBIZ-Saas application
    And I have bank statements and transactions in the system
    And I have navigated to the "Chat" page

  Scenario: Asking for recent transactions
    When I type "show me last 10 transactions" in the chat input
    And I submit the message
    Then I should see a response showing a table of the last 10 transactions
    And the table should include Date, Description, and Amount columns
    And the transactions should be sorted by date with the most recent first

  Scenario: Asking for account balance
    When I type "what is my current account balance?" in the chat input
    And I submit the message
    Then I should see a response showing the total balance across all accounts
    And the response should include a breakdown by bank account

  Scenario: Asking for transactions by vendor
    When I type "show me all transactions with vendor Amazon" in the chat input
    And I submit the message
    Then I should see a response showing a table of transactions with Amazon
    And the response should include the total amount spent with this vendor

  Scenario: Asking for transactions by date range
    When I type "what transactions occurred between January 1 and January 31, 2023?" in the chat input
    And I submit the message
    Then I should see a response showing transactions from January 2023
    And the response should include a summary of total inflows and outflows

  Scenario: Asking for transactions by amount range
    When I type "show me transactions over €1000" in the chat input
    And I submit the message
    Then I should see a response showing transactions with amounts greater than €1000
    And the transactions should be sorted by amount in descending order

  Scenario: Asking for information about a specific document
    Given I have uploaded a document "invoice123.pdf"
    When I type "tell me about document invoice123.pdf" in the chat input
    And I submit the message
    Then I should see a response with details about the document
    And the response should include document metadata and any linked transactions

  Scenario: Asking for missing bank statements
    When I type "do I have any missing bank statements?" in the chat input
    And I submit the message
    Then I should see a response indicating any gaps in statement sequences
    And the response should recommend which statements to upload

  Scenario: Using quick action buttons
    Given the chat interface shows quick action buttons
    When I click on the "Check Balance" quick action button
    Then I should see a response showing my current account balances
    And the response should be the same as if I had typed "what is my current account balance?"

  Scenario: Handling query parsing errors
    When I type "shw my trnsactions" in the chat input with a typo
    And I submit the message
    Then I should see a response suggesting the correct query
    And I should see a "Did you mean: show my transactions?" suggestion
    When I click on the suggestion
    Then the corrected query should be executed

  Scenario: Handling unknown queries
    When I type "what is the meaning of life?" in the chat input
    And I submit the message
    Then I should see a response indicating the query is outside the system's scope
    And the response should suggest relevant financial queries I could ask instead

  Scenario: Maintaining conversation context
    When I type "show me transactions from January" in the chat input
    And I submit the message
    Then I should see January transactions
    When I type "filter those to only show amounts over €1000" as a follow-up
    And I submit the message
    Then I should see only January transactions with amounts over €1000
    And the system should maintain the context of my previous query

  Scenario: Multi-turn conversation with entity tracking
    When I type "show me transactions with Supplier Ltd" in the chat input
    And I submit the message
    Then I should see transactions with Supplier Ltd
    When I type "what was the total amount?" as a follow-up
    And I submit the message
    Then I should see the total amount spent with Supplier Ltd
    And the system should remember we were discussing Supplier Ltd

  Scenario: Viewing chat history
    Given I have previously asked several questions
    When I scroll up in the chat interface
    Then I should see my previous questions and the system's responses
    And the messages should be displayed in chronological order

  Scenario: Chat interface during system errors
    Given the database connection is temporarily unavailable
    When I type "show me my transactions" in the chat input
    And I submit the message
    Then I should see an error message indicating the system cannot access the data
    And I should see a suggestion to try again later 