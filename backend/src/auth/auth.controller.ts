import { Controller, Get, UseGuards, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

// Define the User interface that matches our strategy's return type
interface User {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  accessToken?: string;
}

// Extend Express Request to include our user type
declare global {
  namespace Express {
    interface User {
      googleId: string;
      email: string;
      firstName: string;
      lastName: string;
      picture?: string;
      accessToken?: string;
    }
  }
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req: Request) {
    // This route initiates Google OAuth flow
    // The guard will redirect to Google for authentication
    this.logger.log(`Initiating Google OAuth flow for request from ${req.ip}`);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    this.logger.log('Received callback from Google OAuth');
    
    // User has been authenticated by Google and added to the request by Passport
    const user = req.user as User;
    
    if (!user) {
      this.logger.error('Authentication failed: No user data received from Google');
      return res.status(HttpStatus.UNAUTHORIZED).send('Authentication failed');
    }
    
    // In a production app, this is where you'd create a JWT token
    const token = this.jwtService.sign({
      sub: user.googleId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    
    // Log the user info for debugging during development
    this.logger.log(`Authenticated user: ${user.email} (${user.googleId})`);
    
    // Redirect to frontend with the token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
    
    this.logger.log(`Redirecting to: ${redirectUrl}`);
    
    // In a real app, you'd use a more secure method than query params
    res.redirect(redirectUrl);
  }

  @Get('mock')
  mockAuth(@Req() req: Request, @Res() res: Response) {
    this.logger.log(`Mock authentication requested from ${req.ip}`);
    
    // Create mock user
    const mockUser: User = {
      googleId: 'mock-google-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      picture: 'https://via.placeholder.com/150',
    };
    
    // Create JWT token
    const token = this.jwtService.sign({
      sub: mockUser.googleId,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    });
    
    this.logger.log(`Created mock authentication token for ${mockUser.email}`);
    
    // Redirect to frontend with the token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
    
    this.logger.log(`Redirecting to: ${redirectUrl}`);
    
    // Redirect to the callback page with the token
    res.redirect(redirectUrl);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request) {
    const user = req.user;
    if (user) {
      this.logger.log(`Profile requested for user: ${user.email}`);
    } else {
      this.logger.warn('Profile requested but no user found in request');
    }
    // This route would be protected and return the current user profile
    return req.user;
  }
} 