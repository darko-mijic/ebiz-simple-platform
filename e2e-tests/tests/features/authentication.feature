Feature: User Authentication and Onboarding
  As a user of EBIZ-Saas
  I want to log in with Google and complete the onboarding process
  So that I can start using the app with my company details

  Background:
    Given the EBIZ-Saas application is running

  Scenario: Successful login with Google
    When I click on the "Login with Google" button
    And I authorize the application with my Google account
    Then I should be redirected to the dashboard
    And I should see my Google profile picture in the sidebar

  Scenario: Network error during Google authentication
    When I click on the "Login with Google" button
    And the network connection is interrupted
    Then I should see an error message indicating network issues
    And I should be able to retry the authentication process

  Scenario: First-time user onboarding
    Given I have successfully logged in with Google for the first time
    When I am redirected to the onboarding flow
    Then I should see a form requesting personal and company information
    And I should see my email pre-filled and read-only
    And I should be able to edit my first and last name
    And the phone field should be marked as optional

  Scenario: Returning user with completed onboarding
    Given I have previously completed the onboarding process
    When I log in with my Google account
    Then I should be redirected directly to the dashboard
    And I should see my company information pre-loaded

  Scenario: Completing user onboarding with valid information
    Given I am on the onboarding form
    When I enter my first name "John"
    And I enter my last name "Doe"
    And I leave the phone field empty
    And I select a role "Owner / CEO"
    And I enter company name "Acme Corp"
    And I enter company address "123 Business St, Berlin, Germany"
    And I enter local EU VAT ID "23732108701"
    And I enter EU VAT ID "DE123456789" 
    And I click the "Complete Onboarding" button
    Then I should be redirected to the dashboard
    And I should see "Welcome, John" in the user profile section
    And my user information should be stored in the database with the correct company association

  Scenario: Completing user onboarding with optional phone number
    Given I am on the onboarding form
    When I enter my first name "John"
    And I enter my last name "Doe"
    And I enter my phone number "+1 (555) 123-4567"
    And I select a role "Finance Manager"
    And I enter company name "Acme Corp"
    And I enter company address "123 Business St, Berlin, Germany"
    And I enter local EU VAT ID "23732108701"
    And I click the "Complete Onboarding" button
    Then I should be redirected to the dashboard
    And my user information including the phone number should be stored in the database

  Scenario: Attempting onboarding with invalid VAT ID
    Given I am on the onboarding form
    When I enter all required information
    But I enter an invalid local EU VAT ID "12345"
    And I click the "Complete Onboarding" button
    Then I should see an error message about the invalid VAT ID
    And I should remain on the onboarding form

  Scenario: Logout functionality
    Given I am logged in to the application
    When I click on my profile icon in the sidebar
    And I select "Logout" from the dropdown menu
    Then I should be redirected to the login page
    And I should no longer have access to protected areas of the application

  Scenario: Multiple users with different roles in the same company
    Given the following users exist in the database:
      | google_id       | first_name | last_name | company_name | role    |
      | user1@gmail.com | John       | Doe       | Acme Corp    | owner   |
      | user2@gmail.com | Jane       | Smith     | Acme Corp    | manager |
    When I log in as "user2@gmail.com"
    Then I should be redirected to the dashboard
    And I should see appropriate permissions based on my "manager" role 