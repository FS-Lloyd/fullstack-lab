import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  private tasks: Task[] = [];
  private nextId = 1;

  constructor(private readonly configService: ConfigService) {}

  create(createTaskDto: CreateTaskDto) {
    const maxTaskItems = this.configService.get<number>('maxTaskItems', 10);
    if (this.tasks.length >= maxTaskItems) {
      throw new BadRequestException(`Cannot exceed ${maxTaskItems} tasks`);
    }

    const task: Task = { id: this.nextId++, ...createTaskDto };
    this.tasks.push(task);
    return task;
  }

  findAll() {
    return this.tasks;
  }

  findOne(id: number) {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = this.findOne(id);
    Object.assign(task, updateTaskDto);
    return task;
  }

  remove(id: number) {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    const [removed] = this.tasks.splice(index, 1);
    return removed;
  }
}
