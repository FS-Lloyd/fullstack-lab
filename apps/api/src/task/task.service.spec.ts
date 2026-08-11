import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    configService = { get: jest.fn().mockReturnValue(10) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates tasks up to maxTaskItems', () => {
    configService.get.mockReturnValue(2);

    service.create({ title: 'first' });
    service.create({ title: 'second' });

    expect(service.findAll()).toHaveLength(2);
  });

  it('throws BadRequestException once maxTaskItems is reached', () => {
    configService.get.mockReturnValue(1);

    service.create({ title: 'first' });

    expect(() => service.create({ title: 'second' })).toThrow(
      BadRequestException,
    );
  });
});
