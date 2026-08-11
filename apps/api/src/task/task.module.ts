import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ConfigModule } from '@nestjs/config';
import taskConfiguration from '../config/task-configuration';

@Module({
  imports: [ConfigModule.forFeature(taskConfiguration)],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
