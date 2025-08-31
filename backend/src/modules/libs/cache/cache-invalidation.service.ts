import { Injectable } from '@nestjs/common';
import { RedisService } from '@/src/core/redis/redis.service';

@Injectable()
export class CacheInvalidationService {
  constructor(private readonly redisService: RedisService) {}

  async invalidateUserCache(userId: string) {
    await this.redisService.delPattern(`cache:${userId}:*`);
  }

  async invalidatePublicCache() {
    await this.redisService.delPattern(`cache:guest:*`);
  }

  async invalidateAllCache() {
    await this.redisService.delPattern(`cache:*`);
  }
}
