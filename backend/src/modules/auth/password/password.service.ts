import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { MailService } from '../../libs/mail/mail.service';
import { PasswordChangeDto } from './dto/password-change.dto';
import { hash, verify } from 'argon2';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { TokenType, User } from '@prisma/client'
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { NewPasswordDto, ResetPasswordDto } from './dto/password-recovery.dto';

@Injectable()
export class PasswordService {
  public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService
	) {}
  
  public async passwordChange(req: Request, input: PasswordChangeDto, id: string, userAgent: string) {
		const { currentPassword, password, pin } = input
		
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			}
		})

		if (!user) {
			throw new NotAcceptableException('User not found!')
		}

		const isValidPassword = await verify(user.password, currentPassword)

		if (!isValidPassword) {
			throw new BadRequestException('Invalid password')
		}

		if (!pin) {
			await this.sendPasswordChangeToken(req, user, userAgent)

			return {
				message:
					'Verification code required. Verification code has been sent to your email.'
			}
		}

		await this.validateChangePasswordToken(pin)

		await this.prismaService.user.update({
			where: {
				id: user.id || undefined
			},
			data: {
				password: await hash(password)
			}
		})

		const metadata = getSessionMetadata(req, userAgent)

		await this.mailService.sendPasswordChangeNotificationMail(
			user.email,
			metadata
		)

		return {
			status: true,
			message: null
		}
	}

	private async validateChangePasswordToken(token: string) {
		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.PASSWORD_CHANGE
			}
		})

		if (!existingToken) {
			throw new NotFoundException('Token not found')
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if (hasExpired) {
			throw new BadRequestException('Token has expired')
		}

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.PASSWORD_CHANGE
			}
		})

		return true
	}

	public async sendPasswordChangeToken(
		req: Request,
		user: User,
		userAgent: string
	) {
		const deactivateToken = await generateToken(
			this.prismaService,
			user,
			TokenType.PASSWORD_CHANGE,
			false
		)

		const metadata = getSessionMetadata(req, userAgent)

		await this.mailService.sendPasswordChangeToken(
			user.email,
			deactivateToken.token,
			metadata
		)

		return true
	}

  public async resetPassword(
		req: Request,
		input: ResetPasswordDto,
		userAgent: string
	) {
		const { email } = input

		const user = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		if (!user) {
			throw new NotAcceptableException('User not found!')
		}

		const resetToken = await generateToken(
			this.prismaService,
			user,
			TokenType.PASSWORD_RESET
		)

		const metadata = getSessionMetadata(req, userAgent)

		await this.mailService.sendPasswordResetToken(
			user.email,
			resetToken.token,
			metadata
		)

		return true
	}

	public async newPassword(input: NewPasswordDto, req: Request, userAgent: string) {
		const { password, token } = input

		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.PASSWORD_RESET
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
				password: await hash(password)
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.PASSWORD_RESET
			}
		})

		const metadata = getSessionMetadata(req, userAgent)

		await this.mailService.sendPasswordChangeNotificationMail(
			user.email,
			metadata
		)

		return true
	}
}
