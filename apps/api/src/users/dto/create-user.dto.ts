import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { CreateTaskDto } from '../../tasks/dto/create-task.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @Type(() => CreateTaskDto)
  @ValidateNested({ each: true })
  @IsArray()
  tasks?: CreateTaskDto[];
}
