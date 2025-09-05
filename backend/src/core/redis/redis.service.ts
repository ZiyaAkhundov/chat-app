import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisConfigService extends Redis {
	constructor(private readonly configService: ConfigService) {
		super({
			host: configService.getOrThrow<string>('REDIS_HOST', 'localhost'),
			port: configService.getOrThrow<number>('REDIS_PORT', 6379),
			password: configService.getOrThrow<string>('REDIS_PASSWORD')
		})
	}
}
