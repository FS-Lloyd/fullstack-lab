import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import taskConfiguration from '../config/task-configuration';

@Module({
  imports: [
    ConfigModule.forFeature(taskConfiguration),
    TypeOrmModule.forFeature([Task, User]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
