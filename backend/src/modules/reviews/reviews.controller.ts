import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get reviews' })
  async getReviews(@CurrentUser() user: JwtPayload) {
    return this.reviewsService.getReviews(user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a review' })
  async createReview(
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    return this.reviewsService.createReview(user.sub, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  async getReview(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.reviewsService.getReview(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a review' })
  async updateReview(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.reviewsService.updateReview(user.sub, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a review' })
  async deleteReview(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.reviewsService.deleteReview(user.sub, id);
  }
}
