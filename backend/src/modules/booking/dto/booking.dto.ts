import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  specialistId: string;

  @IsDateString()
  slotStart: string;

  @IsEnum(['online', 'offline'])
  format: string;

  @IsString()
  @IsOptional()
  matchingResultId?: string;

  @IsString()
  @IsOptional()
  promoCode?: string;
}

export class CancelBookingDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class RescheduleBookingDto {
  @IsDateString()
  newSlotStart: string;
}

export class SlotsQueryDto {
  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateScheduleDto {
  @IsString()
  @IsOptional()
  timezone?: string;

  @IsArray()
  @IsOptional()
  recurringSlots?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];

  @IsArray()
  @IsOptional()
  customSlots?: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}
