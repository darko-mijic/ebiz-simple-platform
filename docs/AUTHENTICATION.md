# Google OAuth Authentication in EBIZ Simple Platform

This document provides a detailed overview of the Google OAuth Authentication implementation in the EBIZ Simple Platform.

## Overview

The platform implements a secure authentication system using Google OAuth 2.0, allowing users to sign in with their Google accounts. This document covers the architecture, configuration, and usage of the authentication system.

## Architecture

The authentication system consists of the following components:

### 1. Google OAuth Strategy

Located in `backend/src/auth/strategies/google.strategy.ts`, this component:
- Configures the Google OAuth connection
- Handles the OAuth callback
- Validates user information from Google

### 2. JWT Strategy

Located in `backend/src/auth/strategies/jwt.strategy.ts`, this component:
- Validates JWT tokens for authenticated requests
- Extracts user information from tokens
- Handles token expiration and verification

### 3. Auth Service

Located in `backend/src/auth/auth.service.ts`, this service:
- Handles user creation and lookup
- Generates JWT tokens
- Validates OAuth logins
- Manages user profile updates

### 4. Auth Controller

Located in `backend/src/auth/auth.controller.ts`, this controller:
- Exposes authentication endpoints
- Handles OAuth callback redirection
- Returns authentication tokens to the client

### 5. Auth Guards

Located in `backend/src/auth/guards/`, these guards:
- Protect routes requiring authentication
- Validate authentication tokens
- Handle authentication errors

## Authentication Flow

1. **Initiate Login**:
   - User navigates to `/auth/google`
   - Backend redirects to Google OAuth consent screen

2. **Google Authorization**:
   - User consents to share information with the application
   - Google redirects back to the callback URL with an authorization code

3. **Backend Processing**:
   - Passport.js exchanges the code for access tokens
   - The Google profile information is retrieved
   - User is found or created in the database
   - JWT token is generated

4. **Client Authentication**:
   - JWT token is sent to the client
   - Client stores the token (typically in localStorage or HttpOnly cookie)
   - Token is included in subsequent API requests as a Bearer token

5. **Protected Route Access**:
   - Client includes JWT in the Authorization header
   - JwtAuthGuard validates the token
   - If valid, the request proceeds; otherwise, 401 Unauthorized is returned

## Configuration

### Environment Variables

The authentication system requires the following environment variables:

```
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600s
```

### Google Developer Console Setup

1. Create a project in the [Google Developer Console](https://console.developers.google.com/)
2. Enable the Google+ API
3. Configure the OAuth consent screen
4. Create OAuth 2.0 credentials
5. Set authorized redirect URIs to match your callback URL

## Implementation Details

### Google Strategy Implementation

```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Validate the user with our AuthService
      const user = await this.authService.validateOAuthLogin(profile);
      // Return user object for Passport
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
```

### JWT Strategy Implementation

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.authService.getUserById(payload.sub);
    if (!user) {
      this.logger.logAuthError('JWT validation failed - user not found', null, payload.sub);
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
```

### User Creation and Token Generation

```typescript
async validateOAuthLogin(profile: any): Promise<User> {
  const { id: googleId, emails, name, photos } = profile;
  const email = emails[0].value;
  const profilePictureUrl = photos && photos.length > 0 ? photos[0].value : null;

  // Try to find existing user
  let user = await this.prisma.user.findFirst({
    where: {
      OR: [
        { googleId },
        { email },
      ],
    },
  });

  // If user doesn't exist, create a new one
  if (!user) {
    user = await this.prisma.user.create({
      data: {
        googleId,
        email,
        firstName: name.givenName || '',
        lastName: name.familyName || '',
        profilePictureUrl,
        // Other default values
      },
    });
  }

  return user;
}

async login(user: User) {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
  };

  return {
    accessToken: this.jwtService.sign(payload),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePictureUrl: user.profilePictureUrl,
    },
  };
}
```

## Protected Routes

To protect an endpoint with JWT authentication:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  // req.user contains the authenticated user information
  return req.user;
}
```

## Frontend Integration

### Login Button

```typescript
// Next.js frontend example
function LoginButton() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <Button onClick={handleLogin}>
      Sign in with Google
    </Button>
  );
}
```

### Handling Callback

```typescript
// Next.js frontend example
useEffect(() => {
  // Listen for authentication callback response
  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store token in localStorage or secure cookie
      localStorage.setItem('token', token);
      // Redirect to dashboard
      router.push('/dashboard');
    }
  };
  
  handleCallback();
}, []);
```

### Using JWT Tokens for API Requests

```typescript
// Next.js frontend example
async function fetchUserData() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token
    return router.push('/login');
  }
  
  const response = await fetch('http://localhost:3000/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem('token');
    return router.push('/login');
  }
  
  return await response.json();
}
```

## Testing Authentication

### Manual Testing

1. Visit `/auth/google` to initiate login
2. Complete Google authentication
3. Verify redirect to frontend with token
4. Use token to access protected routes

### Automated Testing

For automated testing, mock the Google OAuth process:

```typescript
// Cypress example
Cypress.Commands.add('loginWithGoogle', () => {
  // Mock Google OAuth by directly hitting the callback URL with test data
  cy.request({
    url: 'http://localhost:3000/api/auth/test-login',
    method: 'POST',
    body: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
  }).then((response) => {
    localStorage.setItem('token', response.body.accessToken);
  });
});
```

## Troubleshooting

Common issues and solutions:

1. **Invalid Redirect URI**: Make sure the callback URL in your Google Developer Console matches the one in your environment variables.

2. **JWT Token Issues**: Check the JWT_SECRET value and ensure it's consistent across deployments.

3. **User Not Found Errors**: Check the logs for specific error messages and verify that the user record exists in the database.

4. **CORS Issues**: Ensure that your backend is configured to accept requests from your frontend domain.

5. **OAuth Scope Problems**: If you're not receiving all the user data you need, check that the correct scopes are requested in the GoogleStrategy. 