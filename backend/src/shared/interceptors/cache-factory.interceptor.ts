import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '@/src/core/redis/redis.service';

export const UserCacheInterceptorFactory = (ttl: number, isPublic = false) => {
  @Injectable()
  class DynamicInterceptor implements NestInterceptor {
    constructor(public readonly redisService: RedisService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest();
      const userId = isPublic ? 'guest' : request.user?.id || 'guest';

      const key = `cache:${userId}:${request.method}:${request.url}`;

      const cached = await this.redisService.get(key);
      if (cached) {
        return of(JSON.parse(cached));
      }

      return next.handle().pipe(
        tap(async (data) => {
          await this.redisService.set(key, JSON.stringify(data), 'EX', Number(ttl));
        })
      );
    }
  }

  return DynamicInterceptor;
};
