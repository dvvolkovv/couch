import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateThreadDto, SendMessageDto } from './dto/messages.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get list of threads for a user (works for both client and specialist roles).
   */
  async getThreads(userId: string) {
    const threads = await this.prisma.directMessageThread.findMany({
      where: {
        OR: [
          { clientId: userId },
          { specialistId: userId },
        ],
        isActive: true,
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    const result = await Promise.all(
      threads.map(async (thread) => {
        const otherUserId =
          thread.clientId === userId ? thread.specialistId : thread.clientId;

        const [otherUser, unreadCount] = await Promise.all([
          this.prisma.user.findUnique({
            where: { id: otherUserId },
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          }),
          this.prisma.directMessage.count({
            where: {
              threadId: thread.id,
              senderId: { not: userId },
              readAt: null,
            },
          }),
        ]);

        const lastMessage = thread.messages[0] || null;

        return {
          threadId: thread.id,
          participant: otherUser
            ? {
                id: otherUser.id,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                avatarUrl: otherUser.avatarUrl,
              }
            : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt.toISOString(),
              }
            : null,
          unreadCount,
          lastMessageAt:
            thread.lastMessageAt?.toISOString() ||
            thread.createdAt.toISOString(),
        };
      }),
    );

    return result;
  }

  /**
   * Get a specific thread with paginated messages.
   */
  async getThread(userId: string, threadId: string, page = 1, limit = 50) {
    const thread = await this.prisma.directMessageThread.findFirst({
      where: {
        id: threadId,
        OR: [
          { clientId: userId },
          { specialistId: userId },
        ],
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    const otherUserId =
      thread.clientId === userId ? thread.specialistId : thread.clientId;

    const skip = (page - 1) * limit;

    const [otherUser, messages, total] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      }),
      this.prisma.directMessage.findMany({
        where: { threadId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.directMessage.count({ where: { threadId } }),
    ]);

    return {
      threadId: thread.id,
      participant: otherUser
        ? {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            avatarUrl: otherUser.avatarUrl,
          }
        : null,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        senderName: `${m.sender.firstName} ${m.sender.lastName || ''}`.trim(),
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        readAt: m.readAt?.toISOString() || null,
        createdAt: m.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
      },
    };
  }

  /**
   * Create a new thread or return an existing one.
   */
  async createThread(userId: string, dto: CreateThreadDto) {
    const [currentUser, recipientUser] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      }),
      this.prisma.user.findUnique({
        where: { id: dto.recipientId },
        select: { id: true, role: true, firstName: true, lastName: true, avatarUrl: true },
      }),
    ]);

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    if (!recipientUser) {
      throw new NotFoundException('Recipient not found');
    }

    // Determine clientId and specialistId based on roles
    let clientId: string;
    let specialistId: string;

    if (currentUser.role === 'SPECIALIST') {
      specialistId = userId;
      clientId = dto.recipientId;
    } else {
      clientId = userId;
      specialistId = dto.recipientId;
    }

    // Check if thread already exists
    const existing = await this.prisma.directMessageThread.findUnique({
      where: { clientId_specialistId: { clientId, specialistId } },
    });

    if (existing) {
      return {
        threadId: existing.id,
        isNew: false,
      };
    }

    // Create new thread
    const thread = await this.prisma.directMessageThread.create({
      data: { clientId, specialistId },
    });

    this.logger.log(
      `New thread created: ${thread.id} between ${clientId} and ${specialistId}`,
    );

    return {
      threadId: thread.id,
      isNew: true,
    };
  }

  /**
   * Send a message in a thread.
   */
  async sendMessage(userId: string, threadId: string, dto: SendMessageDto) {
    const thread = await this.prisma.directMessageThread.findFirst({
      where: {
        id: threadId,
        OR: [
          { clientId: userId },
          { specialistId: userId },
        ],
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Create message and update thread lastMessageAt atomically
    const [message] = await this.prisma.$transaction([
      this.prisma.directMessage.create({
        data: {
          threadId,
          senderId: userId,
          content: dto.content,
          fileUrl: dto.fileUrl,
          fileName: dto.fileName,
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.directMessageThread.update({
        where: { id: threadId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return {
      id: message.id,
      threadId,
      content: message.content,
      senderId: message.senderId,
      senderName: `${message.sender.firstName} ${message.sender.lastName || ''}`.trim(),
      senderAvatar: message.sender.avatarUrl,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      readAt: null,
      createdAt: message.createdAt.toISOString(),
    };
  }

  /**
   * Mark all messages in a thread as read (those sent by the other user).
   */
  async markThreadAsRead(userId: string, threadId: string) {
    const thread = await this.prisma.directMessageThread.findFirst({
      where: {
        id: threadId,
        OR: [
          { clientId: userId },
          { specialistId: userId },
        ],
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    const result = await this.prisma.directMessage.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { updated: result.count };
  }

  /**
   * Get total unread messages count across all threads for a user.
   */
  async getTotalUnreadCount(userId: string) {
    const threads = await this.prisma.directMessageThread.findMany({
      where: {
        OR: [
          { clientId: userId },
          { specialistId: userId },
        ],
        isActive: true,
      },
      select: { id: true },
    });

    const threadIds = threads.map((t) => t.id);
    if (threadIds.length === 0) return { unreadCount: 0 };

    const count = await this.prisma.directMessage.count({
      where: {
        threadId: { in: threadIds },
        senderId: { not: userId },
        readAt: null,
      },
    });

    return { unreadCount: count };
  }
}
