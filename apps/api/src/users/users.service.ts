import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { firstName, middleName, lastName } = createUserDto;

      const existingUser = await queryRunner.manager.findOneBy(User, {
        firstName,
        middleName: middleName ?? IsNull(),
        lastName,
      });

      if (existingUser) {
        throw new ConflictException('A user with this name already exists');
      }

      const user = queryRunner.manager.create(User, createUserDto);
      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`I couldn't add this user: ${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.userRepository.find({
      take: limit,
      skip: offset,
      relations: ['tasks'],
    });
  }

  async findOne(id: number, withRelations: boolean = false) {
    const task = await this.userRepository.findOne({
      where: { id },
      relations: withRelations ? ['tasks'] : [],
    });
    if (!task) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }
}
