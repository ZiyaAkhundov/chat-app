// core/session/session.config.ts
import { ConfigService } from '@nestjs/config'
import { RedisStore } from 'connect-redis'
import * as session from 'express-session'

import { ms, StringValue } from '@/src/shared/utils/ms.util'
import { parseBoolean } from '@/src/shared/utils/parse-boolean.util'

import { RedisService } from '../redis/redis.service'

export function setupSession(redis: RedisService, config: ConfigService) {
	return session({
		secret: config.getOrThrow<string>('SESSION_SECRET'),
		name: config.getOrThrow<string>('SESSION_NAME'),
		resave: false,
		saveUninitialized: false,
		cookie: {
			domain: config.getOrThrow<string>('SESSION_DOMAIN'),
			maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
			httpOnly: parseBoolean(
				config.getOrThrow<string>('SESSION_HTTP_ONLY')
			),
			secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
			sameSite: 'lax'
		},
		store: new RedisStore({
			client: redis,
			prefix: config.getOrThrow<string>('SESSION_FOLDER')
		}),
	})
}
