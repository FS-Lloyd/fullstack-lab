import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';
import { TaskStatus } from '../entities/task-status.enum';

export class CreateTaskDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title!: string;

  @Trim()
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsInt()
  @IsOptional()
  userId?: number;
}
