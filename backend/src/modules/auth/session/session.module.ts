import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { VerificationService } from '../verification/verification.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService, VerificationService],
})
export class SessionModule {}
