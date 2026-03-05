import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string) {
    return {
      data: [],
      total: 0,
      unreadCount: 0,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    return {
      id: notificationId,
      read: true,
    };
  }

  async deleteNotification(userId: string, notificationId: string) {
    return { deleted: true };
  }
}
