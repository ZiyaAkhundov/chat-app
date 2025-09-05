import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { VerificationService } from '../verification/verification.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, VerificationService],
})
export class AccountModule {}
