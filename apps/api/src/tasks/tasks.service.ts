import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const maxTaskItems = this.configService.get<number>('maxTaskItems', 10);
    const taskCount = await this.taskRepository.count();
    if (taskCount >= maxTaskItems) {
      throw new BadRequestException(`Cannot exceed ${maxTaskItems} tasks`);
    }

    const { userId, ...taskData } = createTaskDto;
    const task = this.taskRepository.create(taskData);

    if (userId) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User #${userId} not found`);
      }
      task.user = user;
    }

    return this.taskRepository.save(task);
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.taskRepository.find({ take: limit, skip: offset });
  }

  async findOne(id: number) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: number) {
    const task = await this.findOne(id);
    return this.taskRepository.remove(task);
  }
}
