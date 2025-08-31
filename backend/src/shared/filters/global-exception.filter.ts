import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let error: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = exception.getResponse() || exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal server error';
      console.error('Unexpected error:', exception);
    }

    response.status(status).json({
      status: 'error',
      error,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
