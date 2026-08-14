import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { CreateTaskDto } from '../../tasks/dto/create-task.dto';
import { Trim } from '../../common/decorators/trim.decorator';

export class CreateUserDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @Trim()
  @IsString()
  @IsOptional()
  middleName?: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @Type(() => CreateTaskDto)
  @ValidateNested({ each: true })
  @IsArray()
  tasks?: CreateTaskDto[];
}
