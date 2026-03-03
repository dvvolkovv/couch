import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApplySpecialistDto, UpdateSpecialistDto } from './dto/specialist.dto';

@Injectable()
export class SpecialistsService {
  private readonly logger = new Logger(SpecialistsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: ApplySpecialistDto) {
    const existing = await this.prisma.specialistProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('Specialist profile already exists');
    }

    const profile = await this.prisma.$transaction(async (tx) => {
      // Update user role to SPECIALIST
      await tx.user.update({
        where: { id: userId },
        data: { role: 'SPECIALIST' },
      });

      return tx.specialistProfile.create({
        data: {
          userId,
          type: dto.type as any,
          education: dto.education,
          experienceYears: dto.experienceYears,
          approaches: dto.approaches,
          specializations: dto.specializations,
          sessionPrice: dto.sessionPrice,
          sessionDuration: dto.sessionDuration || 50,
          workFormats: dto.workFormats,
        },
      });
    });

    return {
      specialistId: profile.id,
      status: 'PENDING',
      message:
        'Application received. Documents will be reviewed within 48 hours. You can start the AI interview now.',
      nextStep: 'ai_interview',
    };
  }

  async getMe(userId: string) {
    const profile = await this.prisma.specialistProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            valueProfile: { select: { id: true } },
          },
        },
        documents: true,
        specialistSubscription: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Specialist profile not found');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      type: profile.type,
      verification: profile.verification,
      education: profile.education,
      experienceYears: profile.experienceYears,
      approaches: profile.approaches,
      specializations: profile.specializations,
      bio: profile.bio,
      aiBio: profile.aiBio,
      sessionPrice: profile.sessionPrice,
      sessionDuration: profile.sessionDuration,
      workFormats: profile.workFormats,
      videoProvider: profile.videoProvider,
      averageRating: profile.averageRating,
      totalReviews: profile.totalReviews,
      totalSessions: profile.totalSessions,
      subscriptionPlan: profile.subscriptionPlan,
      commissionRate: profile.commissionRate,
      hasValueProfile: !!profile.user.valueProfile,
      documents: profile.documents.map((d) => ({
        id: d.id,
        type: d.type,
        fileName: d.fileName,
        status: d.status,
      })),
      createdAt: profile.createdAt,
    };
  }

  async updateMe(userId: string, dto: UpdateSpecialistDto) {
    const profile = await this.prisma.specialistProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Specialist profile not found');
    }

    await this.prisma.specialistProfile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        sessionPrice: dto.sessionPrice,
        approaches: dto.approaches,
        specializations: dto.specializations,
        workFormats: dto.workFormats,
        videoProvider: dto.videoProvider,
        education: dto.education,
      },
    });

    return this.getMe(userId);
  }

  async getPublicProfile(specialistId: string, currentUserId?: string) {
    const profile = await this.prisma.specialistProfile.findUnique({
      where: { id: specialistId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            valueProfile: {
              select: { summaryText: true, values: true },
            },
          },
        },
        scheduleSlots: {
          where: {
            isAvailable: true,
            slotStart: { gte: new Date() },
          },
          orderBy: { slotStart: 'asc' },
          take: 1,
        },
      },
    });

    if (!profile || profile.verification !== 'APPROVED') {
      throw new NotFoundException('Specialist not found');
    }

    const lastName = profile.user.lastName
      ? profile.user.lastName.charAt(0) + '.'
      : '';

    return {
      id: profile.id,
      firstName: profile.user.firstName,
      lastName,
      type: profile.type,
      verified: profile.verification === 'APPROVED',
      education: profile.education,
      experienceYears: profile.experienceYears,
      approaches: profile.approaches,
      specializations: profile.specializations,
      bio: profile.bio,
      avatarUrl: profile.user.avatarUrl,
      videoIntroUrl: profile.videoIntroUrl,
      sessionPrice: profile.sessionPrice,
      sessionDuration: profile.sessionDuration,
      workFormats: profile.workFormats,
      averageRating: profile.averageRating,
      totalReviews: profile.totalReviews,
      nearestAvailableSlot: profile.scheduleSlots[0]?.slotStart || null,
      valueProfile: profile.user.valueProfile
        ? {
            summary: profile.user.valueProfile.summaryText,
            topValues: this.getTopValues(
              profile.user.valueProfile.values as Record<string, number>,
            ),
          }
        : null,
    };
  }

  async uploadDocument(
    userId: string,
    file: { fileName: string; fileUrl: string; fileSize: number; mimeType: string },
    type: string,
  ) {
    const profile = await this.prisma.specialistProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Specialist profile not found');
    }

    return this.prisma.specialistDocument.create({
      data: {
        specialistId: profile.id,
        type,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
      },
    });
  }

  private getTopValues(values: Record<string, number>): string[] {
    if (!values) return [];
    const labels: Record<string, string> = {
      career: 'Career',
      family: 'Family',
      freedom: 'Freedom',
      security: 'Security',
      development: 'Development',
      spirituality: 'Spirituality',
      relationships: 'Relationships',
      health: 'Health',
      creativity: 'Creativity',
      justice: 'Justice',
    };
    return Object.entries(values)
      .filter(([_, v]) => v > 0.7)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => labels[k] || k);
  }
}
