import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  MinLength,
} from 'class-validator';
import { TaskStatus } from '../entities/task-status.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title!: string;

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
