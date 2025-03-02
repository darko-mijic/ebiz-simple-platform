Feature: User and System Settings
  As a user of EBIZ-Saas
  I want to customize application settings
  So that I can tailor the experience to my preferences and update my information

  Background:
    Given I am logged in to the EBIZ-Saas application
    And I have navigated to the "Settings" page

  Scenario: Updating user profile information
    When I click on the "Profile" tab
    Then I should see my current profile information
    When I update my last name to "Smith"
    And I click "Save Changes"
    Then I should see a success message
    And my updated last name should be visible in the profile section
    And my last name should be updated in the sidebar profile display
    And the last_name field in the users table should be updated to "Smith"

  Scenario: Error handling during profile update
    When I click on the "Profile" tab
    And I update my email to an invalid format "not-an-email"
    And I click "Save Changes"
    Then I should see an error message about the invalid email format
    And my changes should not be saved
    And I should remain on the settings page with the form still open

  Scenario: Updating company information
    When I click on the "Company" tab
    Then I should see my current company information
    When I update the company address to "456 New Address St, Berlin, Germany"
    And I click "Save Changes"
    Then I should see a success message
    And the updated company address should be visible in the company section
    And the address field in the companies table should be updated

  Scenario: Changing display theme
    When I click on the "Appearance" tab
    Then I should see theme options
    When I select "Light Mode"
    Then the application theme should change to light mode immediately
    And the theme preference should be saved for future sessions

  Scenario: Switching back to dark mode
    Given I have previously selected "Light Mode"
    When I click on the "Appearance" tab
    And I select "Dark Mode"
    Then the application theme should change to dark mode immediately
    And the theme preference should be saved for future sessions

  Scenario: Updating notification preferences
    When I click on the "Notifications" tab
    Then I should see notification options
    When I toggle "Email notifications for new statements" to ON
    And I toggle "Browser notifications for document recognition issues" to ON
    And I click "Save Preferences"
    Then I should see a success message
    And my notification preferences should be updated

  Scenario: Configuring data display preferences
    When I click on the "Display Preferences" tab
    Then I should see options for customizing data display
    When I select "DD/MM/YYYY" as the preferred date format
    And I select "1.000,00 €" as the preferred number format
    And I click "Save Preferences"
    Then I should see a success message
    And dates and numbers should be displayed according to my preferences throughout the application

  Scenario: Configuring data export preferences
    When I click on the "Export Settings" tab
    Then I should see options for configuring data exports
    When I select "CSV" as the default export format
    And I select "Include transaction details" option
    And I select "Include document links" option
    And I click "Save Export Settings"
    Then I should see a success message
    And my export preferences should be used for future data exports

  Scenario: Export preferences applied to downloaded reports
    Given I have configured my export preferences
    When I navigate to the Transactions page
    And I click "Export Transactions"
    Then the export should use my configured preferences
    And the downloaded file should match my selected format

  Scenario: Managing connected accounts
    When I click on the "Connected Accounts" tab
    Then I should see my Google account connected
    And I should have the option to disconnect it
    When I click "Disconnect" for my Google account
    Then I should see a confirmation dialog
    When I confirm the disconnection
    Then I should be logged out and redirected to the login page

  Scenario: Managing user permissions for company accounts
    Given I am logged in as a company owner
    When I click on the "User Management" tab
    Then I should see a list of users associated with my company
    When I click "Add User"
    And I enter the email "team@example.com"
    And I select the "Viewer" role
    And I click "Send Invitation"
    Then I should see a success message
    And a new record should be created in the user_companies table
    And an invitation email should be sent to "team@example.com"

  Scenario: Database connection error during settings update
    Given the database connection is temporarily unavailable
    When I try to update my profile information
    And I click "Save Changes"
    Then I should see an error message about the connection issue
    And I should see an option to retry the save operation
    When the database connection is restored
    And I click "Retry"
    Then my changes should be saved successfully

  Scenario: Viewing application version information
    When I scroll down on the Settings page
    Then I should see the application version information
    And I should see the last update date
    And I should see a "Terms of Service" link
    And I should see a "Privacy Policy" link 