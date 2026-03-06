import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookingDto, CancelBookingDto, RescheduleBookingDto } from './dto/booking.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    const specialist = await this.prisma.specialistProfile.findUnique({
      where: { id: dto.specialistId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!specialist) {
      throw new NotFoundException('Specialist not found');
    }

    const slotStart = new Date(dto.slotStart);
    const slotEnd = new Date(slotStart.getTime() + specialist.sessionDuration * 60 * 1000);

    // Check for conflicts
    const conflict = await this.prisma.booking.findFirst({
      where: {
        specialistId: dto.specialistId,
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        slotStart: { lt: slotEnd },
        slotEnd: { gt: slotStart },
      },
    });

    if (conflict) {
      throw new ConflictException('This time slot is already booked');
    }

    const commission = Math.round(specialist.sessionPrice * specialist.commissionRate);

    const booking = await this.prisma.booking.create({
      data: {
        clientId: userId,
        specialistId: dto.specialistId,
        slotStart,
        slotEnd,
        duration: specialist.sessionDuration,
        timezone: 'Europe/Moscow',
        format: dto.format || 'online',
        price: specialist.sessionPrice,
        commission,
        specialistPayout: specialist.sessionPrice - commission,
        status: 'PENDING_PAYMENT',
      },
      include: {
        specialist: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    // Notify specialist about new booking
    try {
      await this.notificationsService.create({
        userId: specialist.userId,
        type: 'NEW_BOOKING',
        title: 'Новая запись',
        body: `Новая запись на ${slotStart.toLocaleDateString('ru-RU')} в ${slotStart.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
        channel: 'in_app',
        entityType: 'booking',
        entityId: booking.id,
      });
    } catch (err) {
      this.logger.warn(`Failed to create notification for booking ${booking.id}: ${err}`);
    }

    return {
      bookingId: booking.id,
      status: booking.status,
      slotStart: booking.slotStart.toISOString(),
      slotEnd: booking.slotEnd.toISOString(),
      duration: booking.duration,
      format: booking.format,
      specialist: {
        id: booking.specialistId,
        firstName: booking.specialist.user.firstName,
        lastName: booking.specialist.user.lastName,
      },
      price: booking.price,
    };
  }

  async listBookings(userId: string, role: string) {
    const where = role === 'SPECIALIST'
      ? { specialist: { userId } }
      : { clientId: userId };

    const bookings = await this.prisma.booking.findMany({
      where,
      orderBy: { slotStart: 'desc' },
      include: {
        specialist: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        review: { select: { id: true } },
      },
    });

    return bookings.map((b) => ({
      bookingId: b.id,
      status: b.status,
      slotStart: b.slotStart.toISOString(),
      slotEnd: b.slotEnd.toISOString(),
      format: b.format,
      videoLink: b.videoLink,
      specialist: {
        id: b.specialistId,
        firstName: b.specialist.user.firstName,
        lastName: b.specialist.user.lastName,
        avatarUrl: b.specialist.user.avatarUrl,
      },
      price: b.price,
      matchScore: b.matchScore,
      canCancel: ['PENDING_PAYMENT', 'CONFIRMED'].includes(b.status),
      canReschedule: b.status === 'CONFIRMED' && b.slotStart > new Date(),
      hasReview: !!b.review,
    }));
  }

  async getBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { clientId: userId },
          { specialist: { userId } },
        ],
      },
      include: {
        specialist: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        review: { select: { id: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return {
      bookingId: booking.id,
      status: booking.status,
      slotStart: booking.slotStart.toISOString(),
      slotEnd: booking.slotEnd.toISOString(),
      duration: booking.duration,
      format: booking.format,
      videoLink: booking.videoLink,
      specialist: {
        id: booking.specialistId,
        firstName: booking.specialist.user.firstName,
        lastName: booking.specialist.user.lastName,
        avatarUrl: booking.specialist.user.avatarUrl,
      },
      price: booking.price,
      matchScore: booking.matchScore,
      canCancel: ['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status),
      canReschedule: booking.status === 'CONFIRMED' && booking.slotStart > new Date(),
      hasReview: !!booking.review,
    };
  }

  async cancelBooking(userId: string, bookingId: string, dto: CancelBookingDto) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        clientId: userId,
        status: { in: ['PENDING_PAYMENT', 'CONFIRMED'] },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or cannot be cancelled');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED_CLIENT',
        cancelledAt: new Date(),
        cancelReason: dto.reason,
      },
    });

    // Notify specialist about cancellation
    try {
      const cancelledBooking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { specialist: { select: { userId: true } } },
      });
      if (cancelledBooking) {
        await this.notificationsService.create({
          userId: cancelledBooking.specialist.userId,
          type: 'BOOKING_CANCELLED',
          title: 'Запись отменена',
          body: 'Клиент отменил запись',
          channel: 'in_app',
          entityType: 'booking',
          entityId: bookingId,
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to create cancellation notification: ${err}`);
    }

    return {
      bookingId: updated.id,
      status: updated.status,
    };
  }

  async rescheduleBooking(userId: string, bookingId: string, dto: RescheduleBookingDto) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        clientId: userId,
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or cannot be rescheduled');
    }

    const newSlotStart = new Date(dto.newSlotStart);
    const newSlotEnd = new Date(newSlotStart.getTime() + booking.duration * 60 * 1000);

    // Check for conflicts with new slot
    const conflict = await this.prisma.booking.findFirst({
      where: {
        specialistId: booking.specialistId,
        id: { not: bookingId },
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        slotStart: { lt: newSlotEnd },
        slotEnd: { gt: newSlotStart },
      },
    });

    if (conflict) {
      throw new ConflictException('This time slot is already booked');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        slotStart: newSlotStart,
        slotEnd: newSlotEnd,
        status: 'PENDING_PAYMENT',
      },
    });

    return {
      bookingId: updated.id,
      status: updated.status,
      slotStart: updated.slotStart.toISOString(),
      slotEnd: updated.slotEnd.toISOString(),
    };
  }
}
