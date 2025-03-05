import { Controller, Get, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
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
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This route initiates Google OAuth flow
    // The guard will redirect to Google for authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    // User has been authenticated by Google and added to the request by Passport
    const user = req.user as User;
    
    if (!user) {
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
    console.log('Authenticated user:', user);
    
    // Redirect to frontend with the token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    
    // In a real app, you'd use a more secure method than query params
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request) {
    // This route would be protected and return the current user profile
    return req.user;
  }
} 