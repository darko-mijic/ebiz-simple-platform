import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '../../src/common/logger/logger.service';
import { AuthService } from '../../src/auth/auth.service';
import { GoogleProfile } from '../../src/auth/strategies/google.strategy';

describe('Google Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let authService: AuthService;
  let loggerService: LoggerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    authService = moduleFixture.get<AuthService>(AuthService);
    loggerService = moduleFixture.get<LoggerService>(LoggerService);

    await app.init();

    // Set up a spy on the logger to prevent console output during tests
    jest.spyOn(loggerService, 'log').mockImplementation(() => {});
    jest.spyOn(loggerService, 'debug').mockImplementation(() => {});
    jest.spyOn(loggerService, 'error').mockImplementation(() => {});
    jest.spyOn(loggerService, 'warn').mockImplementation(() => {});
    jest.spyOn(loggerService, 'logAuth').mockImplementation(() => {});
    jest.spyOn(loggerService, 'logAuthError').mockImplementation(() => {});
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('OAuth Validation', () => {
    it('should create a new user from a Google profile', async () => {
      // Mock Google profile data
      const mockGoogleProfile: GoogleProfile = {
        id: 'google-123456789',
        displayName: 'Test User',
        name: {
          familyName: 'User',
          givenName: 'Test',
        },
        emails: [{ value: 'test-oauth@example.com', verified: true }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
        provider: 'google',
      };

      // Clean up any existing test user
      await prismaService.user.deleteMany({
        where: {
          email: mockGoogleProfile.emails[0].value,
        },
      });

      // Validate OAuth login (normally called by GoogleStrategy)
      const user = await authService.validateOAuthLogin(mockGoogleProfile);

      // Assertions for user creation
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(mockGoogleProfile.emails[0].value);
      expect(user.firstName).toBe(mockGoogleProfile.name.givenName);
      expect(user.lastName).toBe(mockGoogleProfile.name.familyName);
      expect(user.googleId).toBe(mockGoogleProfile.id);
      expect(user.profilePictureUrl).toBe(mockGoogleProfile.photos?.[0]?.value || null);

      // Test login using the user
      const loginResult = await authService.login(user);

      // Assertions for login response
      expect(loginResult).toBeDefined();
      expect(loginResult.accessToken).toBeDefined();
      expect(loginResult.user).toBeDefined();
      expect(loginResult.user.id).toBe(user.id);
      expect(loginResult.user.email).toBe(user.email);

      // Verify JWT token
      const decodedToken = jwtService.verify(loginResult.accessToken);
      expect(decodedToken).toBeDefined();
      expect(decodedToken.sub).toBe(user.id);
      expect(decodedToken.email).toBe(user.email);
    });

    it('should update an existing user from a Google profile', async () => {
      // Mock Google profile data
      const mockGoogleProfile: GoogleProfile = {
        id: 'google-updated-12345',
        displayName: 'Updated User',
        name: {
          familyName: 'User',
          givenName: 'Updated',
        },
        emails: [{ value: 'test-oauth-update@example.com', verified: true }],
        photos: [{ value: 'https://example.com/updated-photo.jpg' }],
        provider: 'google',
      };

      // Create a user first
      const existingUser = await prismaService.user.create({
        data: {
          email: mockGoogleProfile.emails[0].value,
          firstName: 'Original',
          lastName: 'User',
          googleId: 'old-google-id',
          profilePictureUrl: 'https://example.com/old-photo.jpg',
          isOnboardingCompleted: true,
        },
      });

      // Validate OAuth login (which should update the existing user)
      const updatedUser = await authService.validateOAuthLogin(mockGoogleProfile);

      // Assertions for user update
      expect(updatedUser).toBeDefined();
      expect(updatedUser.id).toBe(existingUser.id);
      expect(updatedUser.email).toBe(existingUser.email);
      expect(updatedUser.firstName).toBe(mockGoogleProfile.name.givenName);
      expect(updatedUser.lastName).toBe(mockGoogleProfile.name.familyName);
      expect(updatedUser.googleId).toBe(mockGoogleProfile.id);
      expect(updatedUser.profilePictureUrl).toBe(mockGoogleProfile.photos?.[0]?.value || null);

      // Clean up test data
      await prismaService.user.delete({
        where: { id: updatedUser.id },
      });
    });

    it('should handle missing email in Google profile', async () => {
      // Mock Google profile with missing email
      const mockGoogleProfile: GoogleProfile = {
        id: 'google-no-email',
        displayName: 'No Email User',
        name: {
          familyName: 'User',
          givenName: 'No Email',
        },
        emails: [], // Empty emails array
        provider: 'google',
      };

      // Attempt to validate OAuth login
      await expect(
        authService.validateOAuthLogin(mockGoogleProfile)
      ).rejects.toThrow();
    });
  });

  describe('JWT Authentication', () => {
    it('should validate a valid JWT token', async () => {
      // Create a test user
      const testUser = await prismaService.user.create({
        data: {
          email: 'jwt-test@example.com',
          firstName: 'JWT',
          lastName: 'Test',
          googleId: 'google-jwt-test',
          profilePictureUrl: 'https://example.com/jwt-test.jpg',
          isOnboardingCompleted: true,
        },
      });

      // Generate JWT for the user
      const loginResult = await authService.login(testUser);
      const token = loginResult.accessToken;

      // Test accessing an authenticated endpoint
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      // Assertions for authenticated response
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testUser.id);
      expect(response.body.email).toBe(testUser.email);

      // Clean up test data
      await prismaService.user.delete({
        where: { id: testUser.id },
      });
    });

    it('should reject an invalid JWT token', async () => {
      // Test accessing an authenticated endpoint with invalid token
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      // Assertions for unauthorized response
      expect(response.status).toBe(401);
    });

    it('should allow access to public routes without authentication', async () => {
      // Test accessing a public endpoint (login page)
      const response = await request(app.getHttpServer())
        .get('/auth/login');

      // Assertions for public route
      expect(response.status).toBe(200);
    });
  });
}); 