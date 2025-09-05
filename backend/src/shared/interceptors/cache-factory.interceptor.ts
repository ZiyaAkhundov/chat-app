import { RedisCacheService } from '@/src/modules/redis/cache.service';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export const UserCacheInterceptorFactory = (ttl: number, isPublic = false) => {
  @Injectable()
  class DynamicInterceptor implements NestInterceptor {
    constructor(public readonly redisService: RedisCacheService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest();
      const userId = isPublic ? 'guest' : request.user?.id || 'guest';
      const key = `cache:${userId}:${request.method}:${request.url}`;

      const cache = await this.redisService.getUserCache(key)
      if (cache) {
        return of(JSON.parse(cache));
      }

      return next.handle().pipe(
        tap(async (data) => {
          await this.redisService.setUserCache(key, data, ttl)
        })
      );
    }
  }

  return DynamicInterceptor;
};
