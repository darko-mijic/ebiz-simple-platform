// ***********************************************
// This file is for custom Cypress commands
// ***********************************************

// Mock Google OAuth login
Cypress.Commands.add('mockGoogleLogin', (userData = {}) => {
  // Default user data if none provided
  const defaultUserData = {
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    profilePictureUrl: 'https://placeholder.com/150',
    isOnboardingCompleted: false
  };
  
  const user = { ...defaultUserData, ...userData };
  
  // Intercept auth/check endpoint to mock authenticated user
  cy.intercept('GET', `${Cypress.env('apiUrl')}/auth/check`, {
    statusCode: 200,
    body: {
      isAuthenticated: true,
      user
    }
  }).as('checkAuth');
  
  // Simulate successful login (visit onboarding directly)
  cy.visit('/onboarding');
  
  // Wait for authentication check to complete
  cy.wait('@checkAuth');
  
  return cy.wrap(user);
});

// Simulate going through user onboarding step
Cypress.Commands.add('completeUserOnboarding', (userData = {}) => {
  const defaultUserData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    phone: '1234567890',
    role: 'owner'
  };
  
  const userFormData = { ...defaultUserData, ...userData };
  
  // Intercept the user onboarding API call
  cy.intercept('POST', `${Cypress.env('apiUrl')}/onboarding/user`, {
    statusCode: 200,
    body: userFormData
  }).as('saveUserInfo');
  
  // Fill out user form
  cy.get('input[name="firstName"]').clear().type(userFormData.firstName);
  cy.get('input[name="lastName"]').clear().type(userFormData.lastName);
  cy.get('input[name="email"]').clear().type(userFormData.email);
  if (userFormData.phone) {
    cy.get('input[name="phone"]').clear().type(userFormData.phone);
  }
  
  // Submit form
  cy.contains('button', 'Next').click();
  
  // Wait for API call to complete
  cy.wait('@saveUserInfo');
});

// Simulate going through company onboarding step
Cypress.Commands.add('completeCompanyOnboarding', (companyData = {}) => {
  const defaultCompanyData = {
    name: 'Test Company',
    vatId: '12345678901',
    euVatId: 'HR12345678901',
    address: 'Test Address 123',
    city: 'Test City',
    postalCode: '10000',
    country: 'HR',
    industry: 'technology'
  };
  
  const companyFormData = { ...defaultCompanyData, ...companyData };
  
  // Intercept the company onboarding API call
  cy.intercept('POST', `${Cypress.env('apiUrl')}/onboarding/company`, {
    statusCode: 200,
    body: {
      id: 'test-company-id',
      name: companyFormData.name,
      ...companyFormData
    }
  }).as('saveCompanyInfo');
  
  // Intercept the onboarding completion API call
  cy.intercept('POST', `${Cypress.env('apiUrl')}/onboarding/complete`, {
    statusCode: 200,
    body: {
      success: true,
      isOnboardingCompleted: true
    }
  }).as('completeOnboarding');
  
  // Fill out company form
  cy.get('input[name="companyName"]').clear().type(companyFormData.name);
  cy.get('input[name="vatId"]').clear().type(companyFormData.vatId);
  cy.get('input[name="euVatId"]').clear().type(companyFormData.euVatId);
  cy.get('input[name="address"]').clear().type(companyFormData.address);
  cy.get('input[name="city"]').clear().type(companyFormData.city);
  cy.get('input[name="postalCode"]').clear().type(companyFormData.postalCode);
  
  // Select country from dropdown
  cy.get('button:contains("Select country")').click();
  cy.contains('div[role="option"]', companyFormData.country).click();
  
  // Select industry from dropdown
  cy.get('button:contains("Select industry")').click();
  cy.contains('div[role="option"]', companyFormData.industry).click();
  
  // Accept terms
  cy.get('input[name="terms"]').check();
  
  // Submit form
  cy.contains('button', 'Complete Setup').click();
  
  // Wait for API calls to complete
  cy.wait('@saveCompanyInfo');
  cy.wait('@completeOnboarding');
});

// Simulate logout
Cypress.Commands.add('logout', () => {
  // Intercept the logout API call
  cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/logout`, {
    statusCode: 200,
    body: {
      success: true
    }
  }).as('logout');
  
  // Trigger logout
  cy.get('button:contains("Logout")').click();
  
  // Wait for API call to complete
  cy.wait('@logout');
}); 