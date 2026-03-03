import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { GenerateRecommendationsDto, MatchingFeedbackDto } from './dto/matching.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Matching')
@ApiBearerAuth()
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate specialist recommendations' })
  async generateRecommendations(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateRecommendationsDto,
  ) {
    return this.matchingService.generateRecommendations(
      user.sub,
      dto.conversationId,
      dto.limit || 5,
    );
  }

  @Post('feedback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit matching feedback' })
  async submitFeedback(
    @CurrentUser() user: JwtPayload,
    @Body() dto: MatchingFeedbackDto,
  ) {
    return this.matchingService.recordFeedback(
      user.sub,
      dto.matchingResultId,
      dto.specialistId,
      dto.action,
      dto.rejectReason,
      dto.comment,
    );
  }

  @Get('score/:specialistId')
  @ApiOperation({ summary: 'Get match score with a specific specialist' })
  async getMatchScore(
    @CurrentUser() user: JwtPayload,
    @Param('specialistId') specialistId: string,
  ) {
    return this.matchingService.getMatchScore(user.sub, specialistId);
  }
}
