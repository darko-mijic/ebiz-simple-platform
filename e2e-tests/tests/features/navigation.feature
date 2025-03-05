Feature: Navigation and UI Elements
  As a user of EBIZ-Saas
  I want to navigate through the application easily
  So that I can access different features efficiently

  Background:
    Given I am logged in to the EBIZ-Saas application

  Scenario: Left-hand sidebar navigation
    Then I should see a sidebar with navigation links for:
      | Link            |
      | Dashboard       |
      | Bank Accounts   |
      | Transactions    |
      | Documents       |
      | Chat Interface  |
      | Settings        |
    And I should see my profile icon at the bottom of the sidebar

  Scenario: Navigating to Dashboard
    When I click on "Dashboard" in the sidebar
    Then I should be taken to the Dashboard page
    And I should see the dashboard content including recent transactions and documents
    And the URL should be updated to include "/dashboard"

  Scenario: Navigating to Bank Accounts
    When I click on "Bank Accounts" in the sidebar
    Then I should be taken to the Bank Accounts page
    And I should see a list of my bank accounts
    And the URL should be updated to include "/bank-accounts"

  Scenario: Navigating to Transactions
    When I click on "Transactions" in the sidebar
    Then I should be taken to the Transactions page
    And I should see a table of transactions
    And the URL should be updated to include "/transactions"

  Scenario: Navigating to Documents
    When I click on "Documents" in the sidebar
    Then I should be taken to the Documents page
    And I should see a list of uploaded documents
    And the URL should be updated to include "/documents"

  Scenario: Navigating to Chat Interface
    When I click on "Chat Interface" in the sidebar
    Then I should be taken to the Chat Interface page
    And I should see the chat input field and response area
    And the URL should be updated to include "/chat"

  Scenario: Navigating to Settings
    When I click on "Settings" in the sidebar
    Then I should be taken to the Settings page
    And I should see the settings options
    And the URL should be updated to include "/settings"

  Scenario: Browser history navigation
    Given I have visited the following pages in order:
      | Page          |
      | Dashboard     |
      | Transactions  |
      | Documents     |
    When I click the browser's back button
    Then I should be taken to the Transactions page
    When I click the back button again
    Then I should be taken to the Dashboard page
    When I click the forward button twice
    Then I should be taken to the Documents page

  Scenario: Direct URL navigation
    When I navigate directly to "/transactions" in the browser
    Then I should be taken to the Transactions page
    And I should see a table of transactions

  Scenario: Collapsing the sidebar
    Given the sidebar is expanded
    When I click on the collapse button
    Then the sidebar should collapse to show only icons
    And the main content area should expand to fill the space

  Scenario: Expanding the sidebar
    Given the sidebar is collapsed
    When I click on the expand button
    Then the sidebar should expand to show icons and text labels
    And the main content area should adjust accordingly

  Scenario: Opening profile dropdown
    When I click on my profile icon in the sidebar
    Then I should see a dropdown menu with options:
      | Option          |
      | Profile         |
      | Settings        |
      | Logout          |

  Scenario: Keyboard navigation through sidebar
    When I press the Tab key multiple times to focus on sidebar items
    Then I should see a visual focus indicator on each item as I tab through
    When I press Enter on the focused "Transactions" item
    Then I should be taken to the Transactions page

  Scenario: Keyboard shortcut navigation
    When I press "Alt+D"
    Then I should be taken to the Dashboard page
    When I press "Alt+T"
    Then I should be taken to the Transactions page
    When I press "Alt+B"
    Then I should be taken to the Bank Accounts page
    When I press "Alt+C"
    Then I should be taken to the Chat Interface page

  Scenario: Switching between light and dark mode
    Given I am on any page in the application
    When I click on the theme toggle in the header
    Then the application theme should switch between light and dark mode
    And the toggle icon should update to reflect the current mode

  Scenario: Screen reader accessibility
    Given I am using a screen reader
    When I load the application
    Then all navigation elements should have proper ARIA labels
    And all interactive elements should be correctly announced by the screen reader
    And I should be able to navigate the entire application using only keyboard commands

  Scenario: Responsive design on tablet
    Given I am using a tablet device with width between 768px and 1200px
    When I access the application
    Then the sidebar should be collapsed by default
    And I should be able to expand it by clicking the expand button
    And all content should be properly formatted for the tablet screen size

  Scenario: Responsive design on mobile
    Given I am using a mobile device with width less than 768px
    When I access the application
    Then the sidebar should be replaced with a hamburger menu
    When I click on the hamburger menu
    Then the navigation options should appear as an overlay
    And all content should be stacked vertically for easy mobile viewing

  Scenario: Session timeout handling
    Given my session has been inactive for the timeout period
    When I try to navigate to a new page
    Then I should see a session timeout warning
    And I should be given the option to extend my session
    And I should be redirected to the login page if I don't respond