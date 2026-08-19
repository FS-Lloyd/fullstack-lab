import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  catch(exception: Error, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const { message } = exception;

    const [status, name]: [HttpStatus, string] =
      exception instanceof HttpException
        ? [exception.getStatus(), exception.name]
        : [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'];

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl} - ${status} ${message}`,
        exception.stack,
      );
    }

    const body: ApiResponse = {
      statusCode: status,
      timestamp: new Date().toLocaleTimeString(),
      message,
      error: name,
    };

    response.status(status).json(body);
  }
}
