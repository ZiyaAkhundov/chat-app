import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Request } from 'express'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { generateToken } from '@/src/shared/utils/generate-token.util'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { saveSession } from '@/src/shared/utils/session.util'

import { MailService } from '../../libs/mail/mail.service'
import { TokenType, User } from '@prisma/client'
import { VerificationDto } from './dto/verification.dto'
import { RedisSessionService } from '../../redis/session.service'

@Injectable()
export class VerificationService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly redisSessionService: RedisSessionService
	) {}

	public async verifyEmail(
		req: Request,
		input: VerificationDto,
		userAgent: string
	) {
		const { token } = input

		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.EMAIL_VERIFY
			}
		})

		if (!existingToken) {
			throw new NotFoundException('Token not found')
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if (hasExpired) {
			throw new BadRequestException('Token has expired')
		}

		const user = await this.prismaService.user.update({
			where: {
				id: existingToken.userId || undefined
			},
			data: {
				isEmailVerified: true
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.EMAIL_VERIFY
			}
		})

		const metadata = getSessionMetadata(req, userAgent)

		return saveSession(req, user, metadata, this.redisSessionService)
	}

	public async sendEmailVerificationToken(user: User) {
		 const verificationToken = await generateToken(
			this.prismaService,
			user,
			TokenType.EMAIL_VERIFY,
		)

		await this.mailService.sendEmailVerificationToken(user.email, verificationToken.token)

		return true
	}
}

