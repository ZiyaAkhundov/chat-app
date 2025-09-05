import { Global, Module } from '@nestjs/common';
import { RedisSessionService } from './session.service';
import { RedisCacheService } from './cache.service';

@Global()
@Module({
  providers: [RedisSessionService, RedisCacheService],
  exports: [RedisSessionService, RedisCacheService], 
})
export class RedisModule {}
