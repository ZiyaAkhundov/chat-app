import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { VerificationService } from '../verification/verification.service';
import { CacheInvalidationService } from '../../libs/cache/cache-invalidation.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, VerificationService, CacheInvalidationService],
})
export class AccountModule {}
