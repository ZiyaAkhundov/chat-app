import { Body, Controller, Post, Put, Req } from '@nestjs/common'
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiResponse
} from '@nestjs/swagger'
import { Request } from 'express'

import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'

import { PasswordChangeDto } from './dto/password-change.dto'
import { NewPasswordDto, ResetPasswordDto } from './dto/password-recovery.dto'
import { PasswordService } from './password.service'

@Controller('password')
export class PasswordController {
	constructor(private readonly passwordService: PasswordService) {}

	@Authorization()
	@Put('change')
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Password change' })
	@ApiBody({ type: PasswordChangeDto })
	@ApiResponse({
		status: 200,
		description: 'List of user sessions',
		type: [Object]
	})
	public async passwordChange(
		@Req() req: Request,
		@Body() input: PasswordChangeDto,
		@Authorized('id') id: string,
		@UserAgent() UserAgent: string
	) {
		return this.passwordService.passwordChange(req, input, id, UserAgent)
	}

	@Post('reset')
	@ApiOperation({ summary: 'Request password reset' })
	@ApiBody({ type: PasswordChangeDto })
	@ApiResponse({ status: 200, description: 'Password reset initiated' })
	public async resetPassword(
		@Req() req: Request,
		@Body() input: ResetPasswordDto,
		@UserAgent() UserAgent: string
	) {
		return this.passwordService.resetPassword(req, input, UserAgent)
	}

	@Post('new-password')
	@ApiOperation({ summary: 'Set new password' })
	@ApiBody({ type: NewPasswordDto })
	@ApiResponse({ status: 200, description: 'Password has been reset' })
	public async newPassword(
		@Req() req: Request,
		@Body() input: NewPasswordDto,
		@UserAgent() UserAgent: string
	) {
		return this.passwordService.newPassword(input, req, UserAgent)
	}
}
