import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiChatService } from './ai-chat.service';
import { CreateConsultationDto, ConfirmConsultationDto } from './dto/ai.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('consultations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new AI consultation or interview' })
  async createConsultation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateConsultationDto,
  ) {
    return this.aiChatService.createConsultation(user.sub, dto.type);
  }

  @Get('consultations')
  @ApiOperation({ summary: 'List user consultations' })
  async listConsultations(@CurrentUser() user: JwtPayload) {
    return this.aiChatService.listConsultations(user.sub);
  }

  @Get('consultations/:id')
  @ApiOperation({ summary: 'Get consultation with message history' })
  async getConsultation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.aiChatService.getConsultation(user.sub, id);
  }

  @Post('consultations/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm consultation results' })
  async confirmConsultation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ConfirmConsultationDto,
  ) {
    return this.aiChatService.confirmConsultation(
      user.sub,
      id,
      dto.corrections,
    );
  }
}
