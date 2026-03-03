import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        valueProfile: { select: { id: true } },
        clientSubscription: {
          select: {
            plan: true,
            aiConsultationsUsed: true,
            aiConsultationsLimit: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      gender: user.gender,
      city: user.city,
      timezone: user.timezone,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      hasValueProfile: !!user.valueProfile,
      subscription: user.clientSubscription
        ? {
            plan: user.clientSubscription.plan,
            aiConsultationsUsed: user.clientSubscription.aiConsultationsUsed,
            aiConsultationsLimit: user.clientSubscription.aiConsultationsLimit,
          }
        : { plan: 'free', aiConsultationsUsed: 0, aiConsultationsLimit: 1 },
      createdAt: user.createdAt,
    };
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        age: dto.age,
        gender: dto.gender,
        city: dto.city,
        timezone: dto.timezone,
      },
    });

    return this.getMe(userId);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    return { avatarUrl };
  }

  async deleteMe(userId: string) {
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + 30);

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return {
      message:
        'Account will be deleted in 30 days. Contact support to cancel.',
      deleteAt: deleteAt.toISOString(),
    };
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
