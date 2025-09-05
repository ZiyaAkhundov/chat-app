import { Injectable } from '@nestjs/common'

import { RedisConfigService } from '@/src/core/redis/redis.service'

@Injectable()
export class RedisCacheService {
	public constructor(private readonly redisService: RedisConfigService) {}

	async getUserCache(key: string) {
		const cached = await this.redisService.get(key)

		return cached
	}

	async setUserCache(key: string, data: any, ttl: number) {
		await this.redisService.set(
			key,
			JSON.stringify(data),
			'EX',
			Number(ttl)
		)
	}

	async invalidateUserCache(userId: string) {
		await this.delPattern(`cache:${userId}:*`)
	}

	async invalidatePublicCache() {
		await this.delPattern(`cache:guest:*`)
	}

	async invalidateAllCache() {
		await this.delPattern(`cache:*`)
	}

	async delPattern(pattern: string): Promise<void> {
		const stream = this.redisService.scanStream({
			match: pattern,
			count: 100
		})

		for await (const keys of stream) {
			if (keys.length) {
				await this.redisService.del(...keys)
			}
		}
	}
}
