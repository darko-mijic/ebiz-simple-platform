#!/usr/bin/env node

const { OAuth2Server } = require('oauth2-mock-server');

// Create a new instance of the mock OAuth2 server
const server = new OAuth2Server();

// Setup and start the server
async function setup() {
  try {
    // Generate a new RSA key and add it to the keystore
    await server.issuer.keys.generate('RS256');
    console.log('Generated RSA key pair for signing tokens');

    // Start the server
    const port = process.env.MOCK_OAUTH_PORT || 8080;
    await server.start(port, 'localhost');
    console.log(`Mock OAuth2 Server is running at ${server.issuer.url}`);
    
    // Configure token response
    server.service.on('beforeTokenSigning', (token, req) => {
      // Add custom claims to the token
      Object.assign(token, {
        sub: 'mock-google-id',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        given_name: 'Test',
        family_name: 'User',
        picture: 'https://via.placeholder.com/150'
      });
      return token;
    });

    // Configure userinfo response
    server.service.on('userinfo', (userInfoResponse, req) => {
      userInfoResponse.body = {
        sub: 'mock-google-id',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        given_name: 'Test',
        family_name: 'User',
        picture: 'https://via.placeholder.com/150'
      };
    });

    // Log some useful information
    console.log(`Authorization URL: ${server.issuer.url}/auth`);
    console.log(`Token URL: ${server.issuer.url}/token`);
    console.log(`JWKS URL: ${server.issuer.url}/jwks`);
    console.log(`Discovery URL: ${server.issuer.url}/.well-known/openid-configuration`);
    console.log('\nTest user credentials:');
    console.log('- Email: test@example.com');
    console.log('- Name: Test User');
    console.log('- Google ID: mock-google-id');
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down mock OAuth2 server...');
  await server.stop();
  process.exit(0);
});

// Run the server
setup(); 