import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Handler');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();
    const handler = `${context.getClass().name}.${context.getHandler().name}`;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() =>
        this.logger.log(
          `${req.method} ${req.originalUrl} - ${handler} - ${Date.now() - startTime}ms`,
        ),
      ),

      map((data: unknown): ApiResponse => ({
        statusCode: res.statusCode,
        timestamp: new Date().toLocaleTimeString(),
        data,
      })),
    );
  }
}
