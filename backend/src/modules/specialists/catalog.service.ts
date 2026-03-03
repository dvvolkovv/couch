import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CatalogQueryDto } from './dto/specialist.dto';
import { normalizePagination } from '../../common/types/pagination';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async search(query: CatalogQueryDto) {
    const { cursor, limit } = normalizePagination({
      cursor: query.cursor,
      limit: query.limit,
    });

    const where: Prisma.SpecialistProfileWhereInput = {
      verification: 'APPROVED',
      user: { isActive: true, isBanned: false },
    };

    if (query.type) {
      where.type = query.type as any;
    }
    if (query.priceMin || query.priceMax) {
      where.sessionPrice = {};
      if (query.priceMin) where.sessionPrice.gte = query.priceMin;
      if (query.priceMax) where.sessionPrice.lte = query.priceMax;
    }
    if (query.format) {
      where.workFormats = { has: query.format };
    }
    if (query.language) {
      where.languages = { has: query.language };
    }
    if (query.ratingMin) {
      where.averageRating = { gte: query.ratingMin };
    }
    if (query.specialization && query.specialization.length > 0) {
      where.specializations = { hasSome: query.specialization };
    }
    if (query.approach && query.approach.length > 0) {
      where.approaches = { hasSome: query.approach };
    }
    if (query.gender) {
      where.user = { ...where.user as any, gender: query.gender };
    }

    let orderBy: Prisma.SpecialistProfileOrderByWithRelationInput = {
      averageRating: 'desc',
    };
    if (query.sortBy === 'price_asc') orderBy = { sessionPrice: 'asc' };
    if (query.sortBy === 'price_desc') orderBy = { sessionPrice: 'desc' };
    if (query.sortBy === 'reviews') orderBy = { totalReviews: 'desc' };

    const total = await this.prisma.specialistProfile.count({ where });

    const findArgs: Prisma.SpecialistProfileFindManyArgs = {
      where,
      orderBy,
      take: limit + 1,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            gender: true,
            valueProfile: { select: { summaryText: true, values: true } },
          },
        },
      },
    };

    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1;
    }

    const results = await this.prisma.specialistProfile.findMany(findArgs);

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const data = items.map((sp: any) => {
      const lastName = sp.user.lastName
        ? sp.user.lastName.charAt(0) + '.'
        : '';
      const topValues = this.extractTopValues(
        sp.user.valueProfile?.values as Record<string, number> | undefined,
      );

      return {
        id: sp.id,
        firstName: sp.user.firstName,
        lastName,
        type: sp.type,
        verified: true,
        avatarUrl: sp.user.avatarUrl,
        specializations: sp.specializations,
        approaches: sp.approaches,
        sessionPrice: sp.sessionPrice,
        workFormats: sp.workFormats,
        averageRating: sp.averageRating,
        totalReviews: sp.totalReviews,
        topValues,
      };
    });

    // Compute available filters
    const priceAgg = await this.prisma.specialistProfile.aggregate({
      where: { verification: 'APPROVED' },
      _min: { sessionPrice: true },
      _max: { sessionPrice: true },
    });

    return {
      data,
      pagination: { cursor: nextCursor, hasMore, total },
      filters: {
        availableTypes: ['PSYCHOLOGIST', 'COACH', 'PSYCHOTHERAPIST'],
        priceRange: {
          min: priceAgg._min.sessionPrice || 0,
          max: priceAgg._max.sessionPrice || 0,
        },
      },
    };
  }

  async getSpecializations() {
    const profiles = await this.prisma.specialistProfile.findMany({
      where: { verification: 'APPROVED' },
      select: { specializations: true, approaches: true },
    });

    const specCounts: Record<string, number> = {};
    const approachCounts: Record<string, number> = {};

    for (const p of profiles) {
      for (const s of p.specializations) {
        specCounts[s] = (specCounts[s] || 0) + 1;
      }
      for (const a of p.approaches) {
        approachCounts[a] = (approachCounts[a] || 0) + 1;
      }
    }

    return {
      specializations: Object.entries(specCounts)
        .map(([key, count]) => ({ key, label: key, count }))
        .sort((a, b) => b.count - a.count),
      approaches: Object.entries(approachCounts)
        .map(([key, count]) => ({ key, label: key, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  private extractTopValues(
    values: Record<string, number> | undefined,
  ): string[] {
    if (!values) return [];
    return Object.entries(values)
      .filter(([, v]) => v > 0.7)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => k);
  }
}
