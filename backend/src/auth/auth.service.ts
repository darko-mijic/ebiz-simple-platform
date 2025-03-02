import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { User } from '@prisma/client';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async validateOAuthLogin(profile: any): Promise<User> {
    this.logger.logAuth('OAuth validation started', undefined, { 
      provider: 'google',
      profileId: profile.id,
      email: profile.emails?.[0]?.value
    });

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
      this.logger.logAuth('Creating new user from OAuth', undefined, { 
        provider: 'google', 
        email 
      });

      user = await this.prisma.user.create({
        data: {
          googleId,
          email,
          firstName: name.givenName || '',
          lastName: name.familyName || '',
          profilePictureUrl,
          // Store user settings with defaults
          settings: {
            create: {
              language: 'en',
              theme: 'light',
              primaryCurrency: 'EUR',
              notificationsEnabled: true,
              dashboardLayout: {},
            },
          },
        },
        include: {
          settings: true,
        },
      });

      this.logger.logAuth('User created from OAuth', user.id, { 
        firstName: user.firstName, 
        lastName: user.lastName,
        email: user.email
      });
    } 
    // If user exists but doesn't have googleId set (e.g., registered with email)
    else if (!user.googleId) {
      this.logger.logAuth('Linking existing user to Google account', user.id, { 
        provider: 'google', 
        email 
      });

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          googleId,
          profilePictureUrl,
        },
      });
    } else {
      this.logger.logAuth('Existing user logged in with OAuth', user.id, { 
        provider: 'google' 
      });
      
      // Always update profile data on login to keep it fresh
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: name.givenName || user.firstName,
          lastName: name.familyName || user.lastName,
          profilePictureUrl,
        },
      });
    }

    return user;
  }

  async login(user: User) {
    this.logger.logAuth('User login', user.id, { 
      email: user.email 
    });
    
    // Create payload for JWT token
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // Generate JWT token
    const token = this.jwtService.sign(payload);
    this.logger.logAuth('JWT token generated', user.id);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    this.logger.debug(`Fetching user by ID: ${userId}`, 'AuthService');
    
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
      },
    });
  }
} 