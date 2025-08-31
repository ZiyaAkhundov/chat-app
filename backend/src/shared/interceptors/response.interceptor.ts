import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  status: string;
  message?: string;
  data: T;
  timestamp: string;
}

const sanitizeUser = (user: User) => {
  const { password, totpSecret, createdAt, updatedAt, ...rest } = user;
  return rest;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data) => {
        let sanitized = data;

        if (Array.isArray(data)) {
          sanitized = data.map(item => (item?.id && item?.email ? sanitizeUser(item) : item));
        } else if (data?.id && data?.email) {
          sanitized = sanitizeUser(data);
        }

        return {
        status: 'success',
        data: sanitized,
        message: data?.message ?? undefined,
        timestamp: new Date().toISOString(),
        }
      }),
    );
  }
}

