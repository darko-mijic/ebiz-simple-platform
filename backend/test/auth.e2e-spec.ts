import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let testUserData;
  let validToken;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    // Get the Prisma and JWT services for test setup
    prismaService = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    // Create a test user before each test
    testUserData = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      googleId: 'test-google-id',
      isOnboardingCompleted: false,
    };

    // Ensure the test user doesn't exist
    await prismaService.user.deleteMany({
      where: { email: testUserData.email },
    });

    // Create the test user
    const user = await prismaService.user.create({
      data: testUserData,
    });

    // Generate a valid JWT token for the test user
    validToken = jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  });

  afterAll(async () => {
    // Clean up after tests
    await prismaService.user.deleteMany({
      where: { email: testUserData.email },
    });
    await app.close();
  });

  describe('/auth/check (GET)', () => {
    it('should return isAuthenticated:false when no token is provided', () => {
      return request(app.getHttpServer())
        .get('/auth/check')
        .expect(401); // Unauthorized status
    });

    it('should return isAuthenticated:true with user data when a valid token is provided', () => {
      return request(app.getHttpServer())
        .get('/auth/check')
        .set('Cookie', [`auth_session=${validToken}`])
        .expect(200)
        .expect((res) => {
          expect(res.body.isAuthenticated).toBe(true);
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBe(testUserData.email);
        });
    });

    it('should return isAuthenticated:false when token is valid but user does not exist (DB reset case)', async () => {
      // Create valid token
      const token = validToken;
      
      // Delete the user from the database to simulate DB reset
      await prismaService.user.deleteMany({
        where: { email: testUserData.email },
      });

      // Test with the now-invalid token (valid signature but non-existent user)
      return request(app.getHttpServer())
        .get('/auth/check')
        .set('Cookie', [`auth_session=${token}`])
        .expect(200)
        .expect((res) => {
          expect(res.body.isAuthenticated).toBe(false);
          expect(res.body.error).toBe('user_not_found');
          expect(res.body.action).toBe('clear_cookies');
          
          // Check if Set-Cookie header exists and clears the cookie
          const cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
          expect(cookies.some(cookie => cookie.includes('auth_session=;'))).toBe(true);
        });
    });

    it('should return isAuthenticated:false when token is invalid', () => {
      return request(app.getHttpServer())
        .get('/auth/check')
        .set('Cookie', ['auth_session=invalid-token'])
        .expect(401); // Unauthorized status
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should clear auth cookie on logout', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`auth_session=${validToken}`])
        .expect(200)
        .expect((res) => {
          // Check if the Set-Cookie header exists and clears the cookie
          const cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
          expect(cookies.some(cookie => cookie.includes('auth_session=;'))).toBe(true);
          
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('Logged out successfully');
        });
    });
  });
}); 