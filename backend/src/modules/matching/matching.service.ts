import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ScoringService } from './scoring.service';
import { LlmService } from '../ai/llm.service';

const ALGORITHM_VERSION = 'v1.2';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
    private readonly llmService: LlmService,
  ) {}

  /**
   * Generate top-N specialist recommendations for a client.
   * Two-stage process:
   *   Stage 1: Hard filter + pgvector ANN search (top 50)
   *   Stage 2: Precise scoring with full formula (top N)
   */
  async generateRecommendations(
    userId: string,
    conversationId: string | undefined,
    limit: number = 5,
  ) {
    const startTime = Date.now();

    // Get client's value profile
    const clientProfile = await this.prisma.valueProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new NotFoundException(
        'Value profile not found. Complete an AI consultation first.',
      );
    }

    const clientValues = clientProfile.values as Record<string, number>;
    const clientStyle = clientProfile.communicationStyle as Record<string, number>;
    const clientWorldview = clientProfile.worldview as Record<string, number> | null;
    const clientPrefs = clientProfile.preferences as Record<string, any> | null;
    const requestType = clientProfile.requestType;
    const requestSummary = clientProfile.requestSummary;

    // Stage 1: Hard filter
    const filterWhere: any = {
      verification: 'APPROVED',
      user: { isActive: true, isBanned: false },
    };

    if (clientPrefs?.format) {
      filterWhere.workFormats = { has: clientPrefs.format };
    }
    if (clientPrefs?.priceRange) {
      filterWhere.sessionPrice = {
        gte: clientPrefs.priceRange[0] || 0,
        lte: clientPrefs.priceRange[1] || 100000,
      };
    }

    const candidates = await this.prisma.specialistProfile.findMany({
      where: filterWhere,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            valueProfile: true,
          },
        },
        scheduleSlots: {
          where: { isAvailable: true, slotStart: { gte: new Date() } },
          orderBy: { slotStart: 'asc' },
          take: 1,
        },
      },
    });

    if (candidates.length === 0) {
      throw new UnprocessableEntityException(
        'No specialists match your criteria. Try adjusting your preferences.',
      );
    }

    // Stage 2: Precise scoring
    const scored = candidates
      .filter((c) => c.user.valueProfile) // Must have a value profile
      .map((candidate) => {
        const specProfile = candidate.user.valueProfile!;
        const specValues = specProfile.values as Record<string, number>;
        const specStyle = specProfile.communicationStyle as Record<string, number>;
        const specWorldview = specProfile.worldview as Record<string, number> | null;
        const specProfValues = specProfile.professionalValues as Record<string, number> | null;

        const { score, breakdown } = this.scoringService.computeMatchScore({
          clientValues,
          clientStyle,
          clientWorldview: clientWorldview || undefined,
          clientRequestType: requestType || undefined,
          clientRequestSummary: requestSummary || undefined,
          specialistValues: specValues,
          specialistStyle: specStyle,
          specialistWorldview: specWorldview || undefined,
          specialistProfessionalValues: specProfValues || undefined,
          specialistSpecializations: candidate.specializations,
          specialistApproaches: candidate.approaches,
        });

        return { candidate, score, breakdown };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Generate explanations for top matches
    const recommendations = await Promise.all(
      scored.map(async (item, index) => {
        const c = item.candidate;
        const lastName = c.user.lastName ? c.user.lastName.charAt(0) + '.' : '';

        const explanation = await this.generateExplanation({
          requestSummary: requestSummary || '',
          clientTopValues: this.getTopValueLabels(clientValues),
          specialistName: c.user.firstName || 'Specialist',
          specialistSpecializations: c.specializations,
          specialistApproaches: c.approaches,
          breakdown: item.breakdown,
          score: item.score,
        });

        return {
          rank: index + 1,
          specialistId: c.id,
          matchScore: item.score,
          specialist: {
            firstName: c.user.firstName,
            lastName,
            type: c.type,
            avatarUrl: c.user.avatarUrl,
            sessionPrice: c.sessionPrice,
            averageRating: c.averageRating,
            totalReviews: c.totalReviews,
            nearestAvailableSlot: c.scheduleSlots[0]?.slotStart || null,
          },
          explanation,
        };
      }),
    );

    const generationTimeMs = Date.now() - startTime;

    // Save matching result
    const matchingResult = await this.prisma.matchingResult.create({
      data: {
        clientId: userId,
        conversationId: conversationId || null,
        results: recommendations,
        totalCandidates: candidates.length,
        generatedAt: new Date(),
        generationTimeMs,
        algorithmVersion: ALGORITHM_VERSION,
      },
    });

    return {
      matchingResultId: matchingResult.id,
      totalCandidates: candidates.length,
      generationTimeMs,
      algorithmVersion: ALGORITHM_VERSION,
      recommendations,
    };
  }

  /**
   * Get match score for a specific specialist.
   */
  async getMatchScore(userId: string, specialistId: string) {
    const clientProfile = await this.prisma.valueProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new NotFoundException('Value profile not found');
    }

    const specialist = await this.prisma.specialistProfile.findUnique({
      where: { id: specialistId },
      include: {
        user: { select: { valueProfile: true } },
      },
    });

    if (!specialist || !specialist.user.valueProfile) {
      throw new NotFoundException('Specialist profile not found');
    }

    const specProfile = specialist.user.valueProfile;
    const { score, breakdown } = this.scoringService.computeMatchScore({
      clientValues: clientProfile.values as Record<string, number>,
      clientStyle: clientProfile.communicationStyle as Record<string, number>,
      clientWorldview: (clientProfile.worldview as Record<string, number>) || undefined,
      clientRequestType: clientProfile.requestType || undefined,
      clientRequestSummary: clientProfile.requestSummary || undefined,
      specialistValues: specProfile.values as Record<string, number>,
      specialistStyle: specProfile.communicationStyle as Record<string, number>,
      specialistWorldview: (specProfile.worldview as Record<string, number>) || undefined,
      specialistProfessionalValues: (specProfile.professionalValues as Record<string, number>) || undefined,
      specialistSpecializations: specialist.specializations,
      specialistApproaches: specialist.approaches,
    });

    return {
      specialistId,
      matchScore: score,
      topReasons: this.generateQuickReasons(breakdown),
    };
  }

  /**
   * Record matching feedback.
   */
  async recordFeedback(
    userId: string,
    matchingResultId: string,
    specialistId: string,
    action: string,
    rejectReason?: string,
    comment?: string,
  ) {
    await this.prisma.matchingFeedback.create({
      data: {
        userId,
        matchingResultId,
        specialistId,
        action,
        rejectReason,
        comment,
      },
    });

    return {
      recorded: true,
      message: 'Thank you for your feedback. It will help improve matching.',
    };
  }

  /**
   * Generate a human-readable explanation for why a specialist matches.
   */
  private async generateExplanation(params: {
    requestSummary: string;
    clientTopValues: string[];
    specialistName: string;
    specialistSpecializations: string[];
    specialistApproaches: string[];
    breakdown: Record<string, number>;
    score: number;
  }) {
    // For MVP, generate explanations with heuristics (faster than LLM for each match)
    const points: string[] = [];

    if (params.breakdown.specializationRelevance > 0.6) {
      points.push(
        `Specializes in areas relevant to your request`,
      );
    }

    if (params.breakdown.valueMatch > 0.7) {
      points.push(
        `Strong alignment with your core values: ${params.clientTopValues.join(', ')}`,
      );
    }

    if (params.breakdown.communicationStyleMatch > 0.7) {
      points.push(
        `Communication style closely matches your preferences`,
      );
    }

    if (params.breakdown.approachMatch > 0.7) {
      points.push(
        `Uses approaches that align with your preferred way of working`,
      );
    }

    if (params.specialistApproaches.length > 0) {
      points.push(
        `Practices: ${params.specialistApproaches.slice(0, 3).join(', ')}`,
      );
    }

    if (points.length === 0) {
      points.push(`Good overall match for your profile and preferences`);
    }

    return {
      summary: `${params.specialistName} is a good match for your needs:`,
      points: points.slice(0, 5),
      breakdown: params.breakdown,
    };
  }

  private generateQuickReasons(breakdown: Record<string, number>): string[] {
    const reasons: string[] = [];
    if (breakdown.valueMatch > 0.7) reasons.push('Strong value alignment');
    if (breakdown.communicationStyleMatch > 0.7) reasons.push('Compatible communication style');
    if (breakdown.approachMatch > 0.7) reasons.push('Suitable therapeutic approach');
    if (breakdown.worldviewMatch > 0.7) reasons.push('Similar worldview');
    if (reasons.length === 0) reasons.push('Good overall compatibility');
    return reasons;
  }

  private getTopValueLabels(values: Record<string, number>): string[] {
    const labels: Record<string, string> = {
      career: 'Career', family: 'Family', freedom: 'Freedom',
      security: 'Security', development: 'Development',
      spirituality: 'Spirituality', relationships: 'Relationships',
      health: 'Health', creativity: 'Creativity', justice: 'Justice',
    };
    return Object.entries(values)
      .filter(([, v]) => v > 0.7)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => labels[k] || k);
  }
}
