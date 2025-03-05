#!/usr/bin/env node

const { OAuth2Server } = require('oauth2-mock-server');
const url = require('url');

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
    
    // Add a client
    const clientId = process.env.MOCK_CLIENT_ID || 'mock-client-id';
    const clientSecret = process.env.MOCK_CLIENT_SECRET || 'mock-client-secret';
    
    // Handle authorization requests
    server.service.on('beforeAuthorizeRedirect', (authorizeRedirectUri, req) => {
      console.log('Authorization request received:', req.query);
      console.log('Redirecting to:', req.query.redirect_uri);
      
      // Make sure the redirect URI includes the code parameter
      const redirectUrl = new URL(req.query.redirect_uri);
      if (!redirectUrl.searchParams.has('code')) {
        redirectUrl.searchParams.set('code', 'mock_auth_code');
      }
      
      // Update the redirect URI
      authorizeRedirectUri.url = redirectUrl.toString();
      console.log('Updated redirect URI:', authorizeRedirectUri.url);
    });
    
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
      console.log('Token signing with claims:', token);
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
      console.log('Userinfo response:', userInfoResponse.body);
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
    console.log('\nClient credentials:');
    console.log(`- Client ID: ${clientId}`);
    console.log(`- Client Secret: ${clientSecret}`);
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