import { Module } from '@nestjs/common';
import { CacheInvalidationService } from './cache-invalidation.service';
import { RedisService } from '@/src/core/redis/redis.service';

@Module({
  providers: [CacheInvalidationService, RedisService],
  exports: [CacheInvalidationService],
})
export class CacheModule {}
