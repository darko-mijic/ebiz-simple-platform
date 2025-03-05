import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { LoggerService } from '../common/logger/logger.service';
import { GoogleProfile } from './strategies/google.strategy';

// JWT payload interface
interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// User with settings type
type UserWithSettings = User & {
  settings: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    primaryCurrency: string;
    language: string;
    theme: string;
    dashboardLayout: Prisma.JsonValue;
    notificationsEnabled: boolean;
    userId: string;
  } | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates a user logging in via OAuth (Google)
   */
  async validateOAuthLogin(profile: GoogleProfile, correlationId?: string): Promise<User> {
    try {
      if (!profile || !profile.id) {
        throw new Error('Invalid profile data');
      }

      // Extract email from profile
      const email = profile.emails?.[0]?.value;
      
      if (!email) {
        throw new Error('No email provided in profile');
      }

      this.logger.debug(
        `Looking up user by email: ${email}`,
        {
          correlationId,
          profileId: profile.id,
        }
      );

      // Check if user exists with this email
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // User exists, update the profile data if needed
        this.logger.debug(
          `User exists, updating profile: ${user.id}`,
          {
            correlationId,
            userId: user.id,
            profileId: profile.id,
          }
        );

        // Update profile data and lastLogin
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.id,
            firstName: profile.name?.givenName || user.firstName,
            lastName: profile.name?.familyName || user.lastName,
            profilePictureUrl: profile.photos?.[0]?.value || user.profilePictureUrl,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new user
        this.logger.debug(
          `Creating new user for email: ${email}`,
          {
            correlationId,
            profileId: profile.id,
          }
        );

        user = await this.prisma.user.create({
          data: {
            email,
            googleId: profile.id,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profilePictureUrl: profile.photos?.[0]?.value || null,
            isOnboardingCompleted: false,
            // Create default user settings
            settings: {
              create: {
                primaryCurrency: 'USD',
                language: 'en',
                theme: 'light',
                dashboardLayout: {},
                notificationsEnabled: true,
              },
            },
          },
        });

        this.logger.info(
          `New user created from Google OAuth: ${user.id}`,
          {
            correlationId,
            userId: user.id,
            profileId: profile.id,
          }
        );
      }

      return user;
    } catch (error) {
      this.logger.error(
        `OAuth validation error: ${error instanceof Error ? error.message : String(error)}`,
        {
          correlationId,
          profileId: profile?.id,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }
  }

  /**
   * Handle the login process and generate JWT token
   */
  async login(user: User) {
    try {
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      // Generate JWT token
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.getJwtExpiration(),
      });

      // Update last login information
      await this.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      this.logger.logAuth('User logged in successfully', user.id, {
        method: 'JWT',
        email: user.email,
      });

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePictureUrl: user.profilePictureUrl,
          role: 'USER', // Default role since it's not in the User model directly
        },
      };
    } catch (error) {
      this.logger.logAuthError('Login failed', error, user.id, {
        email: user.email,
      });
      throw error;
    }
  }

  /**
   * Get a user by ID including their settings
   */
  async getUserById(userId: string): Promise<UserWithSettings | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
        include: { settings: true },
      });
    } catch (error) {
      this.logger.error(`Error getting user by ID: ${userId}`, {
        userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return null;
    }
  }

  /**
   * Get JWT token expiration from config or use default
   */
  private getJwtExpiration(): string {
    return this.configService?.get<string>('JWT_EXPIRES_IN') || '24h';
  }
} 