import { IsString, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';

export class GenerateRecommendationsDto {
  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  limit?: number;
}

export class MatchingFeedbackDto {
  @IsString()
  matchingResultId: string;

  @IsString()
  specialistId: string;

  @IsEnum(['selected', 'rejected', 'viewed'])
  action: string;

  @IsString()
  @IsOptional()
  rejectReason?: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
