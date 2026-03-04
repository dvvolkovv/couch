import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';

const SPECIALIST_TYPES = ['PSYCHOLOGIST', 'COACH', 'PSYCHOTHERAPIST'] as const;

export class ApplySpecialistDto {
  @IsEnum(['PSYCHOLOGIST', 'COACH', 'PSYCHOTHERAPIST'])
  type: string;

  @IsInt()
  @Min(0)
  experienceYears: number;

  @IsString()
  @IsOptional()
  education?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  approaches: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  specializations: string[];

  @IsInt()
  @Min(500)
  @Max(50000)
  sessionPrice: number;

  @IsInt()
  @IsOptional()
  sessionDuration?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  workFormats: string[];
}

export class UpdateSpecialistDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsInt()
  @Min(500)
  @Max(50000)
  @IsOptional()
  sessionPrice?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  approaches?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specializations?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workFormats?: string[];

  @IsString()
  @IsOptional()
  videoProvider?: string;

  @IsString()
  @IsOptional()
  education?: string;
}

export class CatalogQueryDto {
  @IsEnum(SPECIALIST_TYPES)
  @IsOptional()
  type?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialization?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  approach?: string[];

  @IsInt()
  @IsOptional()
  priceMin?: number;

  @IsInt()
  @IsOptional()
  priceMax?: number;

  @IsString()
  @IsOptional()
  format?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsOptional()
  ratingMin?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  cursor?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}
