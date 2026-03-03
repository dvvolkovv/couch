import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

interface UpsertProfileData {
  ownerType: 'CLIENT' | 'SPECIALIST';
  values: Record<string, number>;
  communicationStyle: Record<string, number>;
  worldview?: Record<string, number>;
  professionalValues?: Record<string, number>;
  requestType?: string;
  requestSummary?: string;
  summaryText: string;
  conversationId?: string;
}

@Injectable()
export class ValueProfileService {
  private readonly logger = new Logger(ValueProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Create or update a value profile for a user.
   * Also generates and stores the embedding vector.
   */
  async upsertProfile(userId: string, data: UpsertProfileData) {
    // Generate embedding
    const embedding = await this.embeddingService.generateProfileEmbedding({
      values: data.values,
      communicationStyle: data.communicationStyle,
      requestSummary: data.requestSummary,
      requestType: data.requestType,
    });

    const existing = await this.prisma.valueProfile.findUnique({
      where: { userId },
    });

    const profileData = {
      ownerType: data.ownerType,
      values: data.values,
      communicationStyle: data.communicationStyle,
      worldview: data.worldview || undefined,
      professionalValues: data.professionalValues || undefined,
      requestType: data.requestType,
      requestSummary: data.requestSummary,
      summaryText: data.summaryText,
      conversationId: data.conversationId,
    };

    let profile;
    if (existing) {
      profile = await this.prisma.valueProfile.update({
        where: { userId },
        data: {
          ...profileData,
          version: { increment: 1 },
        },
      });
    } else {
      profile = await this.prisma.valueProfile.create({
        data: {
          userId,
          ...profileData,
        },
      });
    }

    // Store embedding using raw SQL (pgvector)
    const embeddingStr = `[${embedding.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `UPDATE value_profiles SET embedding = $1::vector WHERE id = $2`,
      embeddingStr,
      profile.id,
    );

    this.logger.log(`Value profile ${existing ? 'updated' : 'created'} for user ${userId}`);

    return profile;
  }

  /**
   * Get the value profile for the current user.
   */
  async getMyProfile(userId: string) {
    const profile = await this.prisma.valueProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Value profile not found. Complete an AI consultation first.');
    }

    return {
      id: profile.id,
      ownerType: profile.ownerType,
      values: profile.values,
      communicationStyle: profile.communicationStyle,
      requestType: profile.requestType,
      requestSummary: profile.requestSummary,
      summaryText: profile.summaryText,
      version: profile.version,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Get a specialist's public value profile.
   */
  async getSpecialistProfile(specialistId: string) {
    const specialist = await this.prisma.specialistProfile.findUnique({
      where: { id: specialistId },
      select: { userId: true },
    });

    if (!specialist) {
      throw new NotFoundException('Specialist not found');
    }

    const profile = await this.prisma.valueProfile.findUnique({
      where: { userId: specialist.userId },
    });

    if (!profile) {
      throw new NotFoundException('Specialist value profile not found');
    }

    return {
      id: profile.id,
      ownerType: profile.ownerType,
      values: profile.values,
      communicationStyle: profile.communicationStyle,
      summaryText: profile.summaryText,
      version: profile.version,
      updatedAt: profile.updatedAt,
    };
  }
}
