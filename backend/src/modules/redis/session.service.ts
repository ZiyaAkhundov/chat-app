import { Injectable } from '@nestjs/common'

import { RedisConfigService } from '@/src/core/redis/redis.service'

@Injectable()
export class RedisSessionService {
    public constructor(private readonly redisService: RedisConfigService) {}

    async addUserSession(userId: string, sessionId: string) {
        await this.redisService.sadd(`user_sessions:${userId}`, sessionId)
    }

    async removeUserSession(userId: string, sessionId: string) {
        await this.redisService.srem(`user_sessions:${userId}`, sessionId)
    }

    async getUserSessionIds(userId: string): Promise<string[]> {
        return this.redisService.smembers(`user_sessions:${userId}`)
    }

    async getSessionsByIds(sessionIds: string[]): Promise<(string | null)[]> {
        return this.redisService.mget(...sessionIds.map(id => `sessions:${id}`))
    }

    async getCurrentSession(sessionId: string) {
        const sessionData = await this.redisService.get(`sessions:${sessionId}`)
        if (!sessionData) return null

        const session = JSON.parse(sessionData)
        return {
            ...session,
            id: sessionId
        }
    }

    async clearUserSessions(userId: string) {
        const sessions = await this.getUserSessionIds(userId)
        if (sessions.length) {
            await this.redisService.del(...sessions)
        }
        await this.redisService.del(`user_sessions:${userId}`)
    }

    async clearUserSessionBySessionId(userId: string, sessionId: string) {
        await this.redisService.del(`user_sessions:${userId}`, sessionId)
    }
}
