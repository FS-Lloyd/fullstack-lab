import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';

describe('TasksService', () => {
  let service: TasksService;
  let configService: { get: jest.Mock };
  let taskRepository: jest.Mocked<Partial<Repository<Task>>>;

  beforeEach(async () => {
    configService = { get: jest.fn().mockReturnValue(10) };

    const tasks: Task[] = [];
    let nextId = 1;

    taskRepository = {
      count: jest.fn().mockImplementation(() => Promise.resolve(tasks.length)),
      create: jest
        .fn()
        .mockImplementation((dto) => ({ id: nextId++, ...dto }) as Task),
      save: jest.fn().mockImplementation((task: Task) => {
        tasks.push(task);
        return Promise.resolve(task);
      }),
      find: jest.fn().mockImplementation(() => Promise.resolve(tasks)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: ConfigService, useValue: configService },
        { provide: getRepositoryToken(Task), useValue: taskRepository },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates tasks up to maxTaskItems', async () => {
    configService.get.mockReturnValue(2);

    await service.create({ title: 'first' });
    await service.create({ title: 'second' });

    await expect(service.findAll({})).resolves.toHaveLength(2);
  });

  it('throws BadRequestException once maxTaskItems is reached', async () => {
    configService.get.mockReturnValue(1);

    await service.create({ title: 'first' });

    await expect(service.create({ title: 'second' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
