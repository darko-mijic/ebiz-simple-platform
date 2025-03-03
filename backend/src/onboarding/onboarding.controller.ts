import { Controller, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../common/logger/logger.service';
import type { Request } from 'express';
import { CompanyOnboardingDto } from './dto/company-onboarding.dto';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
    userMissing?: boolean;
  };
}

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({ summary: 'Complete user onboarding process' })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully' })
  @Post('user')
  async completeUserOnboarding(@Body() userData: any, @Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    
    if (!userId) {
      this.logger.error('User ID missing during onboarding. Authentication issue detected.');
      throw new Error('Authentication error: User ID is missing. Please log in again.');
    }
    
    this.logger.log(`Completing user onboarding for user ${userId}`);
    
    return await this.onboardingService.updateUserInfo(userId, userData);
  }

  @ApiOperation({ summary: 'Create company during onboarding' })
  @ApiResponse({ status: 200, description: 'Company created successfully' })
  @ApiResponse({ status: 409, description: 'Company with same data already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('company')
  async completeCompanyOnboarding(
    @Body() data: CompanyOnboardingDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      this.logger.error('User ID missing during company onboarding. Authentication issue detected.');
      throw new UnauthorizedException('Authentication error: Please log in again.');
    }
    
    this.logger.log(`Processing company onboarding for user ${userId}`);
    
    try {
      return await this.onboardingService.completeCompanyOnboarding(userId, data);
    } catch (error: unknown) {
      // Let the global exception filter handle the error
      this.logger.error('Error creating company during onboarding', { 
        userId, 
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Rethrow the exception - our global exception filter will format it properly
      throw error;
    }
  }

  @ApiOperation({ summary: 'Mark onboarding process as complete' })
  @ApiResponse({ status: 200, description: 'Onboarding marked as complete' })
  @Post('complete')
  async markOnboardingComplete(@Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    
    if (!userId) {
      this.logger.error('User ID missing during onboarding completion. Authentication issue detected.');
      throw new Error('Authentication error: User ID is missing. Please log in again.');
    }
    
    this.logger.log(`Marking onboarding as complete for user ${userId}`);
    
    const updatedUser = await this.onboardingService.completeOnboarding(userId);
    return {
      success: true,
      isOnboardingCompleted: updatedUser.isOnboardingCompleted
    };
  }
} 