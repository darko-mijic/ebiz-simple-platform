import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateOAuthLogin(profile: any): Promise<User> {
    const { id: googleId, emails, name, photos } = profile;
    const email = emails[0].value;

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
          // Store user settings with defaults
          settings: {
            create: {
              // Note: avatar is not in the schema, so we can't store it there
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
    } 
    // If user exists but doesn't have googleId set (e.g., registered with email)
    else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    return user;
  }

  async login(user: User) {
    // Create payload for JWT token
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // Generate JWT token
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
      },
    });
  }
} 