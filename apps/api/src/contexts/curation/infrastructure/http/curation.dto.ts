import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJourneyDto {
  @ApiProperty({ example: 'Web Dev Journey' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({ example: 'A curated path to learn modern web development.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: ['typescript', 'react'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' })
  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export class AddTaskDto {
  @ApiProperty({ example: 'Practice TypeScript for 1 hour' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ enum: ['MILESTONE', 'RECURRING'] })
  @IsEnum(['MILESTONE', 'RECURRING'])
  kind!: 'MILESTONE' | 'RECURRING';

  @ApiPropertyOptional({ enum: ['DAILY'], description: 'Required when kind=RECURRING' })
  @IsOptional()
  @IsEnum(['DAILY'])
  recurrenceRule?: 'DAILY';
}

export class UpdateJourneyDto {
  @ApiPropertyOptional({ example: 'Updated Journey Title' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: ['react', 'typescript'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ['PUBLIC', 'PRIVATE'] })
  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility?: 'PUBLIC' | 'PRIVATE';
}
