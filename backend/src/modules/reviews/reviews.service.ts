import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReviews(userId: string) {
    return {
      data: [],
      total: 0,
    };
  }

  async createReview(userId: string, body: any) {
    return {
      id: 'stub-review-id',
      message: 'Review creation not yet fully implemented',
    };
  }

  async getReview(reviewId: string) {
    return {
      id: reviewId,
      message: 'Review lookup not yet fully implemented',
    };
  }

  async updateReview(userId: string, reviewId: string, body: any) {
    return {
      id: reviewId,
      message: 'Review update not yet fully implemented',
    };
  }

  async deleteReview(userId: string, reviewId: string) {
    return { deleted: true };
  }
}
