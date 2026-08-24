import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { ResponseLogger } from './middleware/response-logger.middleware';
import { ValidateContentTypeMiddleware } from './middleware/validate-content-type.middleware';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';

const nodeEnv = process.env.NODE_ENV ?? 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.shared', `.env.${nodeEnv}`],
      load: [configuration],
      isGlobal: true,
      expandVariables: true,
    }),
    DatabaseModule,
    UsersModule,
    TasksModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    Logger,
    // Disabled: registering LoggingInterceptor as APP_INTERCEPTOR would apply it globally to
    // every route, wrapping all responses in the ApiResponse envelope. ResponseLogger below
    // covers /tasks logging only; enable this once the envelope is rolled out API-wide.
    // { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {
  configure(middlewareConsumer: MiddlewareConsumer) {
    middlewareConsumer.apply(ValidateContentTypeMiddleware).forRoutes('*');
    middlewareConsumer.apply(ResponseLogger).forRoutes('/tasks');
  }
}
