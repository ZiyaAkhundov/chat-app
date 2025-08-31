import { Body, Controller, Post, Req } from '@nestjs/common'
import { Request } from 'express'

import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'

import { VerificationDto } from './dto/verification.dto'
import { VerificationService } from './verification.service'

@Controller('verification')
export class VerificationController {
	constructor(private readonly verificationService: VerificationService) {}

	@Post('email')
	create( @Req() req: Request, @Body() input: VerificationDto, @UserAgent() UserAgent: string ) {
		return this.verificationService.verifyEmail(req, input, UserAgent)
	}
}
