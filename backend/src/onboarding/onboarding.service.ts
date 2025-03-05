import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { User, Company } from '@prisma/client';
import { CompanyOnboardingDto } from './dto/company-onboarding.dto';

interface UserOnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface CompanyOnboardingData {
  companyName: string;
  vatId: string;
  euVatId?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  industry: string;
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async updateUserInfo(userId: string, data: UserOnboardingData): Promise<User> {
    this.logger.log(`Updating user info during onboarding`, 'OnboardingService', { userId });
    
    if (!userId) {
      this.logger.error('User ID is missing for updateUserInfo', 'OnboardingService');
      throw new NotFoundException('User ID is required to update user information');
    }
    
    try {
      // Verify that user exists before attempting update
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });
      
      if (!userExists) {
        this.logger.error(`User not found for ID: ${userId}`, 'OnboardingService');
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          ...(data.phone ? { phone: data.phone } : {})
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating user info: ${errorMessage}`, 'OnboardingService', { userId });
      throw error;
    }
  }

  async createCompany(data: CompanyOnboardingData, userId: string): Promise<Company> {
    this.logger.log(`Creating company during onboarding`, 'OnboardingService', { userId });
    
    const company = await this.prisma.company.create({
      data: {
        name: data.companyName,
        localVatId: data.vatId,
        euVatId: data.euVatId,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        industry: data.industry,
        users: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      } as any,
    });
    
    return company;
  }

  async completeOnboarding(userId: string): Promise<User> {
    this.logger.log(`Completing onboarding process`, 'OnboardingService', { userId });
    
    try {
      // First check if the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        this.logger.error('User not found during onboarding completion', { userId });
        throw new NotFoundException('User not found');
      }
      
      // Update the user's onboarding status
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          isOnboardingCompleted: true,
        },
      });
      
      this.logger.log('User onboarding marked as complete', { userId });
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error('Error completing user onboarding', { 
        userId, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw new InternalServerErrorException(
        'Failed to mark onboarding as complete. Please try again or contact support.'
      );
    }
  }

  async completeCompanyOnboarding(
    userId: string,
    companyData: CompanyOnboardingDto,
  ): Promise<any> {
    this.logger.debug('Processing company onboarding', { userId, companyData });

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error('User not found during company onboarding', { userId });
      throw new NotFoundException('User not found');
    }

    // Create the company
    try {
      // Ensure localVatId is always a string (mandatory)
      let localVatId = '';
      
      if (companyData.localVatId) {
        localVatId = companyData.localVatId;
      } else if (companyData.vatId) {
        localVatId = companyData.vatId;
      } else {
        // Generate unique ID with timestamp to ensure uniqueness 
        localVatId = `AUTO-${companyData.name.substring(0, 6).replace(/\s/g, '')}-${Date.now()}`;
      }
      
      // First, check if a company with this localVatId already exists
      const existingCompany = await this.prisma.company.findFirst({
        where: { localVatId },
        include: { users: true },
      });
      
      let company;
      
      if (existingCompany) {
        // Company exists, check if user is already connected to it
        const userConnection = existingCompany.users.find(
          (u) => u.userId === userId,
        );
        
        if (!userConnection) {
          // Connect user to existing company
          this.logger.log('Connecting user to existing company', {
            userId,
            companyId: existingCompany.id,
          });
          
          await this.prisma.userCompany.create({
            data: {
              userId: user.id,
              companyId: existingCompany.id,
              role: 'OWNER',
            },
          });
        }
        
        company = existingCompany;
        this.logger.log('Using existing company', { userId, companyId: company.id });
      } else {
        // Create new company
        company = await this.prisma.company.create({
          data: {
            name: companyData.name,
            vatId: companyData.vatId || null,
            euVatId: companyData.euVatId || null,
            localVatId, // Guaranteed to be string
            address: companyData.address || null,
            city: companyData.city || null,
            postalCode: companyData.postalCode || null,
            country: companyData.country || null,
            industry: companyData.industry || null,
            users: {
              create: {
                userId: user.id,
                role: 'OWNER',
              },
            },
          },
        });
        
        this.logger.log('Company created successfully', { 
          userId, 
          companyId: company.id 
        });
      }

      // Update user onboarding flag if exists in schema
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { 
            // Add conditionally based on what's in your schema
            ...(user.hasOwnProperty('isOnboardingCompleted') ? { isOnboardingCompleted: true } : {})
          },
        });
      } catch (updateError) {
        // Log but don't fail if this update isn't possible
        this.logger.warn('Could not update user onboarding status', {
          userId,
          error: updateError instanceof Error ? updateError.message : String(updateError)
        });
      }

      // Return only fields that exist on the company model
      return {
        id: company.id,
        name: company.name,
        localVatId: company.localVatId,
        euVatId: company.euVatId,
        address: company.address,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Don't include stack trace in error message to prevent leaking implementation details
      this.logger.error('Error during company onboarding', { 
        userId, 
        error: errorMessage, 
        stack: error instanceof Error ? error.stack : undefined 
      });
      
      // Check for unique constraint errors
      if (errorMessage.includes('Unique constraint failed')) {
        throw new ConflictException(
          'A company with this information already exists. Please use different company details.',
        );
      }
      
      throw new InternalServerErrorException('Error creating company. Please try again later.');
    }
  }
} 