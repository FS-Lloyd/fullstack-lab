import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ResponseLogger implements NestMiddleware {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('Response');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();
    res.on('finish', () => {
      const { statusCode, statusMessage } = res;
      const responseTime = Date.now() - startTime;
      this.logger.log(
        `${method} ${originalUrl} - ${statusCode} ${statusMessage} (${responseTime}ms)`,
      );
    });
    next();
  }
}
