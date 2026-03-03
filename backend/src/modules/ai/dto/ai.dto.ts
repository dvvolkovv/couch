import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateConsultationDto {
  @IsEnum(['CLIENT_CONSULTATION', 'SPECIALIST_INTERVIEW', 'PROFILE_CORRECTION'])
  type: string;
}

export class ConfirmConsultationDto {
  @IsOptional()
  corrections?: {
    requestSummary?: string;
    preferences?: Record<string, any>;
  };
}

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  content: string;
}
