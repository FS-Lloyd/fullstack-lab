import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH']);

@Injectable()
export class ValidateContentTypeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!MUTATING_METHODS.has(req.method)) {
      return next();
    }

    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      throw new UnsupportedMediaTypeException(
        'Content-Type must be application/json',
      );
    }

    const body = req.body as Record<string, unknown> | undefined;
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Request body must not be empty');
    }

    next();
  }
}
