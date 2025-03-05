import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoggerService } from '../common/logger/logger.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Define JWT payload interface
interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
  userMissing?: boolean; // Flag indicating user is missing from database
}

// Extend Express Request type to include user with JWT payload
interface RequestWithUser extends express.Request {
  user?: JwtPayload;
}

// Define a type for user response to handle the extended user properties
interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profilePictureUrl: string | null;
  isOnboardingCompleted: boolean;
  googleId: string | null;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
  ) {}

  // Add a type guard for the User type with extended properties
  private isFullUserWithOnboarding(user: any): user is (User & { isOnboardingCompleted?: boolean; phone?: string | null; profilePictureUrl?: string | null }) {
    return user && 
      typeof user === 'object' && 
      'id' in user;
  }

  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route is handled by the Guard and redirects to Google
    return { message: 'Google Authentication' };
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
      const token = auth.accessToken;
      
      // Set the token as a cookie for the frontend to use
      res.cookie('auth_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: '/',
        sameSite: 'lax',
        // Don't set domain in development to allow cross-domain cookies
        // domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
      });
      
      // Get user to check onboarding status
      const user = await this.authService.getUserById(userId);
      
      // Determine redirect URL based on onboarding status
      let redirectUrl = `${frontendUrl}/dashboard`;
      
      // Use the type guard to safely check isOnboardingCompleted
      if (this.isFullUserWithOnboarding(user) && user.isOnboardingCompleted === false) {
        redirectUrl = `${frontendUrl}/onboarding`;
        this.logger.logAuth('Redirecting to onboarding', userId, {
          requestId,
          redirectUrl,
        });
      } else {
        this.logger.logAuth('Redirecting to dashboard', userId, {
          requestId,
          redirectUrl,
        });
      }
      
      // Redirect to the appropriate page
      return res.redirect(redirectUrl);
    } catch (error: any) {
      this.logger.logAuthError('OAuth callback error', error, userId, { 
        requestId, 
        error: error?.message || String(error)
      });
      return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error`);
    }
  }

  @ApiOperation({ summary: 'Check if user is authenticated' })
  @ApiResponse({ status: 200, description: 'Returns auth status' })
  @UseGuards(JwtAuthGuard)
  @Get('check')
  async checkAuth(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: express.Response) {
    try {
      // Log the actual request user object for debugging
      this.logger.debug('Auth check request user object', { 
        userObject: req.user,
        hasUser: !!req.user,
        hasSub: !!(req.user && req.user.sub),
        userMissing: !!(req.user && req.user.userMissing)
      });
      
      // Check if token indicates user is missing from database
      if (req.user && req.user.userMissing) {
        this.logger.logAuth('Authentication check failed - valid token but user not in database', req.user.sub, {
          isAuthenticated: false,
          reason: 'user_not_found',
          recommendation: 'clear_cookies'
        });
        
        this.clearAuthCookie(res);
        
        return { 
          isAuthenticated: false, 
          error: 'user_not_found',
          message: 'User not found in database. Please log in again.',
          action: 'clear_cookies'
        };
      }
      
      // Ensure req.user exists and has sub property
      if (!req.user || !req.user.sub) {
        this.logger.logAuth('Authentication check failed - invalid token payload', undefined, {
          isAuthenticated: false,
          reason: 'invalid_token_payload'
        });
        return { 
          isAuthenticated: false, 
          error: 'invalid_token',
          message: 'Invalid authentication token'
        };
      }
      
      const userId = req.user.sub;
      
      // Verify that the user exists in the database
      const user = await this.authService.getUserById(userId);
      
      if (!user) {
        this.logger.logAuth('Authentication check failed - user not found in database', userId, {
          isAuthenticated: false,
          reason: 'user_not_found',
          recommendation: 'clear_cookies'
        });
        
        this.clearAuthCookie(res);
        
        return { 
          isAuthenticated: false, 
          error: 'user_not_found',
          message: 'User not found in database. Please log in again.',
          action: 'clear_cookies'
        };
      }
      
      this.logger.logAuth('Authentication check successful', userId, {
        isAuthenticated: true,
      });
      
      // Apply type guard to ensure safe property access
      if (this.isFullUserWithOnboarding(user)) {
        return {
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || null,
            profilePictureUrl: user.profilePictureUrl || null,
            isOnboardingCompleted: user.isOnboardingCompleted || false,
            googleId: user.googleId || null
          }
        };
      } 
      
      // We know user exists here because we checked above, but TypeScript doesn't
      // So we need to cast it to any to avoid the never type
      const basicUser = user as any;
      
      // Fallback with just the basic properties we know exist
      return {
        isAuthenticated: true,
        user: {
          id: basicUser.id,
          email: basicUser.email,
          firstName: basicUser.firstName,
          lastName: basicUser.lastName,
          phone: null,
          profilePictureUrl: null,
          isOnboardingCompleted: false,
          googleId: basicUser.googleId || null
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.logAuthError('Authentication check error', error);
      return { isAuthenticated: false, error: 'authentication_error', message: errorMessage };
    }
  }

  // Helper to clear the auth cookie
  private clearAuthCookie(res: express.Response): void {
    if (!res) {
      this.logger.warn('Cannot clear auth cookie: Response object is undefined');
      return;
    }
    
    res.clearCookie('auth_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
  }

  @ApiOperation({ summary: 'Log out the user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @Post('logout')
  async logout(@Req() req: RequestWithUser, @Res() res: express.Response) {
    try {
      // Clear the auth cookie
      res.clearCookie('auth_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      });
      
      const userId = req.user?.sub;
      if (userId) {
        this.logger.logAuth('User logged out', userId);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      this.logger.logAuthError('Logout error', error);
      return res.status(500).json({
        success: false,
        message: 'Error during logout',
      });
    }
  }

  @ApiOperation({ summary: 'Debug JWT token (development only)' })
  @ApiResponse({ status: 200, description: 'Token information' })
  @Get('debug-token')
  async debugToken(@Req() req: express.Request) {
    // Only available in development mode
    if (process.env.NODE_ENV === 'production') {
      return { message: 'Not available in production' };
    }
    
    try {
      const token = req.cookies?.auth_session;
      
      if (!token) {
        return { 
          hasToken: false, 
          message: 'No token found in cookies' 
        };
      }
      
      // Decode but don't verify to check token contents
      const decoded = this.jwtService.decode(token);
      
      // Also try to verify
      let isValid = false;
      let verifyError = null;
      
      try {
        this.jwtService.verify(token);
        isValid = true;
      } catch (error) {
        verifyError = error instanceof Error ? error.message : String(error);
      }
      
      // Get user if possible
      let user: any = null;
      if (decoded && typeof decoded === 'object' && 'sub' in decoded) {
        user = await this.authService.getUserById(decoded.sub as string);
      }
      
      return { 
        hasToken: true,
        isValid,
        verifyError,
        decoded,
        userExists: !!user,
        user: user ? {
          id: user.id,
          email: user.email,
          // Don't include sensitive info
        } : null,
      };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
} 