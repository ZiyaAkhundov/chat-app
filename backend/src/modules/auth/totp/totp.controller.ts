import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import type { User } from '@prisma/client'

import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'

import { EnableTotpDto } from './dto/enable-totp.dto'
import { TotpService } from './totp.service'

@Controller('totp')
export class TotpController {
	constructor(private readonly totpService: TotpService) {}

	@Authorization()
	@Get('generate')
	@ApiOperation({ summary: 'Generate TOTP secret and QR code' })
	@ApiResponse({
		status: 200,
		description: 'TOTP secret and QR code generated',
		type: Object
	})
	public async generate(@Authorized() user: User) {
		return this.totpService.generate(user)
	}

	@Authorization()
	@Post('enable')
	@ApiOperation({ summary: 'Enable TOTP for the user' })
	@ApiResponse({
		status: 200,
		description: 'TOTP enabled successfully',
		type: Boolean
	})
	public async enable(
		@Authorized() user: User,
		@Body() input: EnableTotpDto
	) {
		return this.totpService.enable(user, input)
	}

	@Authorization()
	@Post('disable')
	@ApiOperation({ summary: 'Disable TOTP for the user' })
	@ApiResponse({
		status: 200,
		description: 'TOTP disabled successfully',
		type: Boolean
	})
	public async disable(@Authorized() user: User) {
		return this.totpService.disable(user)
	}
}
