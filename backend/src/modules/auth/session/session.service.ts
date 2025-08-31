import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import type { Request } from 'express'
import { TOTP } from 'otpauth'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { RedisService } from '@/src/core/redis/redis.service'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import {
	destroySession,
	saveSession,
	sessionKey
} from '@/src/shared/utils/session.util'

import { VerificationService } from '../verification/verification.service'

import { LoginDto } from './dto/login.dto'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService,
		private readonly verificationService: VerificationService
	) {}

	public async findByUser(req: Request) {
		const userId = req.session.userId
		if (!userId) {
			throw new NotFoundException('User not found in session')
		}

		const sessionIds = await this.redisService.getUserSessions(userId)
		const userSessions: any[] = []

		if (sessionIds.length) {
			const values = await this.redisService.mget(
				...sessionIds.map(id => `sessions:${id}`)
			)

			values.forEach((val, idx) => {
				if (val && sessionIds[idx] !== req.sessionID) {
					const session = JSON.parse(val)
					userSessions.push({
						...session,
						id: sessionIds[idx]
					})
				}
			})
		}

		userSessions.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
		)

		return userSessions
	}

	public async findCurrent(req: Request) {
		const sessionId = req.sessionID

		const session = await this.redisService.getCurrentSession(sessionId)
		if (!session) {
			throw new NotFoundException('Current session not found')
		}

		return session
	}

	public async login(req: Request, dto: LoginDto, userAgent: string) {
		const { login, password, pin } = dto

		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ username: { equals: login } },
					{ email: { equals: login } }
				]
			}
		})

		if (!user) {
			throw new NotFoundException('User not found!')
		}

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) {
			throw new UnauthorizedException('Credentials is not true')
		}

		if (!user.isEmailVerified) {
			await this.verificationService.sendEmailVerificationToken(user)

			throw new BadRequestException(
				'Account not verified. Please check your email for confirmation.'
			)
		}

		if (user.isTotpEnabled) {
			if (!pin) {
				return {
					message: 'A code is required to complete authorization'
				}
			}

			const totp = new TOTP({
				issuer: `${this.configService.getOrThrow<string>('APP_NAME')}:${user.username}`,
				label: `${user.email}`,
				algorithm: 'SHA1',
				digits: 6,
				secret: user.totpSecret?.toString()
			})

			const delta = totp.validate({ token: pin })

			if (delta === null) {
				throw new BadRequestException('Invalid code')
			}
		}

		if (user.deletedAt) {
			await this.prismaService.user.update({
				where: {
					id: user.id
				},
				data: {
					deletedAt: null
				}
			})
		}

		const metadata = getSessionMetadata(req, userAgent)

		return {
			user: await saveSession(req, user, metadata, this.redisService),
			message: null
		}
	}

	public async logout(req: Request) {
		return destroySession(req, this.configService, this.redisService)
	}

	public async clearSession(req: Request) {
		req.res?.clearCookie(
			this.configService.getOrThrow<string>('SESSION_NAME')
		)

		return true
	}

	public async remove(req: Request, id: string) {
		if (req.session.id === id) {
			return new ConflictException(
				'The current session cannot be deleted'
			)
		}

		const key = sessionKey(
			req.session.userId,
			id,
			this.configService.getOrThrow<string>('SESSION_FOLDER')
		)

		await this.redisService.del(key)

		return true
	}
}
