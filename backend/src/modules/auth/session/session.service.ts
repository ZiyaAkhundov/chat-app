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
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import {
	destroySession,
	saveSession,
} from '@/src/shared/utils/session.util'

import { VerificationService } from '../verification/verification.service'

import { LoginDto } from './dto/login.dto'
import { RedisSessionService } from '../../redis/session.service'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisSessionService: RedisSessionService,
		private readonly configService: ConfigService,
		private readonly verificationService: VerificationService
	) {}

	public async findUserSessions(req: Request) {
		const userId = req.session.userId
		if (!userId) {
			throw new NotFoundException('User not found in session')
		}

		const sessionIds = await this.redisSessionService.getUserSessionIds(userId);

		if (!sessionIds.length) return [];
		
		const values = await this.redisSessionService.getSessionsByIds(sessionIds);

		const userSessions = sessionIds.map((id, idx) => {
  		    const val = values[idx];
  		    if (!val) return null;

  		    const session = JSON.parse(val);
  		    return {
  		      id,              
  		      ...session      
  		    };
  		  }).filter(session => session && session.id !== req.sessionID);
	  
  		userSessions.sort(
  		  (a, b) =>
  		    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  		);
	
  		return userSessions;
	}

	public async findCurrentSession(req: Request) {
		const sessionId = req.sessionID

		const session = await this.redisSessionService.getCurrentSession(sessionId)
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
			user: await saveSession(req, user, metadata, this.redisSessionService),
			message: null
		}
	}

	public async logout(req: Request) {
		return destroySession(req, this.configService, this.redisSessionService)
	}

	public async clearSession(req: Request) {
		req.res?.clearCookie(
			this.configService.getOrThrow<string>('SESSION_NAME')
		)

		return true
	}

	public async removeSessionById(req: Request, id: string) {
		if(!req.session.userId) return new UnauthorizedException()

		if (req.session.id === id) {
			return new ConflictException(
				'The current session cannot be deleted'
			)
		}

		await this.redisSessionService.clearUserSessionBySessionId(req.session.userId, req.session.id)

		return true
	}
}
