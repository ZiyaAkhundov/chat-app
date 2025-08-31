import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService extends Redis {
	constructor(private readonly configService: ConfigService) {
		super({
			host: configService.getOrThrow<string>('REDIS_HOST', 'localhost'),
			port: configService.getOrThrow<number>('REDIS_PORT', 6379),
			password: configService.getOrThrow<string>('REDIS_PASSWORD')
		})
	}

	async addUserSession(userId: string, sessionId: string) {
		await this.sadd(`user_sessions:${userId}`, sessionId)
	}

	async removeUserSession(userId: string, sessionId: string) {
		await this.srem(`user_sessions:${userId}`, sessionId)
	}

	async getUserSessions(userId: string): Promise<string[]> {
		return this.smembers(`user_sessions:${userId}`)
	}

	async getCurrentSession(sessionId: string) {
		const sessionData = await this.get(`sessions:${sessionId}`)
		if (!sessionData) return null

		const session = JSON.parse(sessionData)
		return {
			...session,
			id: sessionId
		}
	}

	async clearUserSessions(userId: string) {
		const sessions = await this.getUserSessions(userId)
		if (sessions.length) {
			await this.del(...sessions)
		}
		await this.del(`user_sessions:${userId}`)
	}

	async delPattern(pattern: string): Promise<void> {
		const stream = this.scanStream({
			match: pattern,
			count: 100
		})

		for await (const keys of stream) {
			if (keys.length) {
				await this.del(...keys)
			}
		}
	}
}
