import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    this.logger.logAuth('Initiating Google OAuth flow');
    // This route will redirect to Google for authentication
    // The guard initiates the OAuth flow
  }

  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: express.Request, @Res() res: express.Response) {
    const requestId = Math.random().toString(36).substring(2, 15);
    const userId = (req.user as any)?.id;
    
    try {
      this.logger.logAuth('Received Google OAuth callback', userId, {
        requestId,
        hasUser: !!req.user,
        query: req.query,
      });
      
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
      
      this.logger.logAuth('Authentication successful, redirecting to dashboard', userId, {
        requestId,
        redirectUrl: `${frontendUrl}/dashboard`,
      });
      
      // Redirect to the dashboard
      return res.redirect(`${frontendUrl}/dashboard`);
    } catch (error) {
      this.logger.logAuthError('Authentication failed during callback', error, userId, {
        requestId,
        query: req.query,
      });
      
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
    const userId = (req.user as any)?.id;
    
    this.logger.logAuth('Authentication check', userId, {
      isAuthenticated: true,
    });
    
    // If we reach here, the user is authenticated
    return {
      isAuthenticated: true,
      user: req.user,
    };
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @Post('logout')
  async logout(@Req() req: express.Request, @Res() res: express.Response) {
    const userId = (req.user as any)?.id;
    
    this.logger.logAuth('User logout requested', userId);
    
    // Clear the auth cookie
    res.clearCookie('auth_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    });
    
    this.logger.logAuth('User logged out successfully', userId);
    
    return res.status(200).json({
      message: 'Logged out successfully',
    });
  }
} 