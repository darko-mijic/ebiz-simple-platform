import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route will redirect to Google for authentication
    // The guard initiates the OAuth flow
  }

  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: express.Request, @Res() res: express.Response) {
    try {
      // Generate JWT token using AuthService
      const auth = await this.authService.login(req.user as any);
      
      // Get the frontend URL from config
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const token = auth.access_token;
      
      // Set the token as a cookie for the frontend to use
      res.cookie('auth_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: '/',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
      });
      
      // Redirect to the dashboard
      return res.redirect(`${frontendUrl}/dashboard`);
    } catch (error) {
      console.error('Authentication error:', error);
      // Redirect back to login page on error
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/auth?error=authentication_failed`);
    }
  }

  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({ status: 200, description: 'User is authenticated' })
  @ApiResponse({ status: 401, description: 'User is not authenticated' })
  @Get('check')
  @UseGuards(AuthGuard('jwt'))
  async checkAuth(@Req() req: express.Request) {
    // If we reach here, the user is authenticated
    return {
      isAuthenticated: true,
      user: req.user,
    };
  }
} 