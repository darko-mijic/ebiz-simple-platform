import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { BankStatementsModule } from './bank-statements/bank-statements.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DocumentsModule } from './documents/documents.module';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { VatModule } from './vat/vat.module';
import { ValidatorsModule } from './common/validators/validators.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    BankAccountsModule,
    BankStatementsModule,
    TransactionsModule,
    DocumentsModule,
    ChatModule,
    OnboardingModule,
    VatModule,
    ValidatorsModule,
  ],
})
export class AppModule {} 