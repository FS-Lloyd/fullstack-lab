import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { ResponseLogger } from './middleware/response-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.shared', `.env.${process.env.NODE_ENV}`],
      load: [configuration],
      isGlobal: true,
      expandVariables: true,
    }),
    DatabaseModule,
    UsersModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(middlewareConsumer: MiddlewareConsumer) {
    middlewareConsumer.apply(ResponseLogger).forRoutes('*');
  }
}
