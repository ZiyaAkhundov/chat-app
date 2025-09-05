import { InternalServerErrorException } from '@nestjs/common'
import type { Request } from 'express'


import type { SessionMetadata } from '../types/session-metadata.types'
import { ConfigService } from '@nestjs/config'
import type { User } from '@prisma/client'
import { RedisSessionService } from '@/src/modules/redis/session.service'

export function saveSession(
	req: Request,
	user: User,
	metadata: SessionMetadata, 
	redisSessionService: RedisSessionService
) {
	return new Promise((resolve, reject) => {
		req.session.createdAt = new Date()
		req.session.userId = user.id
		req.session.metadata = metadata

		req.session.save(async(err) => {
			if (err) {
				console.error('Session save error:', err)
				return reject(
					new InternalServerErrorException('Failed to save session')
				)
			}
			await redisSessionService.addUserSession(user.id, req.sessionID)
			resolve(user)
		})
	})
}

export function destroySession (req: Request, configService: ConfigService, redisSessionService: RedisSessionService) {
    return new Promise((resolve, reject) => {
		const userId = req.session?.userId
    	const sessionId = req.sessionID
        req.session.destroy(async(err) => {
            if (err) {
                return reject(
                    new InternalServerErrorException(
                        'Failed to delete session'
                    )
                )
            }

            req.res?.clearCookie(
                configService.getOrThrow<string>('SESSION_NAME')
            )

			if (userId && sessionId) {
        	await redisSessionService.removeUserSession(userId, sessionId)
      }
            resolve(true)
        })
    })
}