import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateScheduleDto } from './dto/booking.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMySchedule(userId: string) {
    const specialist = await this.prisma.specialistProfile.findUnique({
      where: { userId },
      include: {
        scheduleSlots: { orderBy: { dayOfWeek: 'asc' } },
      },
    });

    if (!specialist) {
      throw new NotFoundException('Specialist profile not found');
    }

    const recurringSlots = specialist.scheduleSlots
      .filter((s) => s.isRecurring)
      .map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }));

    const customSlots = specialist.scheduleSlots
      .filter((s) => !s.isRecurring && s.slotDate)
      .map((s) => ({
        id: s.id,
        date: s.slotDate?.toISOString().split('T')[0],
        startTime: s.startTime,
        endTime: s.endTime,
      }));

    return {
      timezone: specialist.user
        ? 'Europe/Moscow'
        : 'Europe/Moscow',
      recurringSlots,
      customSlots,
      blockedDates: [],
    };
  }

  async updateSchedule(userId: string, dto: UpdateScheduleDto) {
    const specialist = await this.prisma.specialistProfile.findUnique({
      where: { userId },
    });

    if (!specialist) {
      throw new NotFoundException('Specialist profile not found');
    }

    // Delete existing slots and recreate (full replacement)
    await this.prisma.scheduleSlot.deleteMany({
      where: { specialistId: specialist.id },
    });

    const slotsToCreate: any[] = [];

    // Recurring slots
    if (dto.recurringSlots) {
      for (const slot of dto.recurringSlots) {
        slotsToCreate.push({
          specialistId: specialist.id,
          isRecurring: true,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true,
        });
      }
    }

    // Custom slots
    if (dto.customSlots) {
      for (const slot of dto.customSlots) {
        const slotDate = new Date(slot.date);
        slotsToCreate.push({
          specialistId: specialist.id,
          isRecurring: false,
          slotDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true,
        });
      }
    }

    if (slotsToCreate.length > 0) {
      await this.prisma.scheduleSlot.createMany({ data: slotsToCreate });
    }

    return this.getMySchedule(userId);
  }

  /**
   * Get available slots for a specialist within a date range.
   */
  async getAvailableSlots(
    specialistId: string,
    from: string,
    to: string,
    timezone: string = 'Europe/Moscow',
  ) {
    const specialist = await this.prisma.specialistProfile.findUnique({
      where: { id: specialistId },
    });

    if (!specialist) {
      throw new NotFoundException('Specialist not found');
    }

    const fromDate = from ? new Date(from) : new Date();
    const toDate = to
      ? new Date(to)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Get recurring slots
    const recurringSlots = await this.prisma.scheduleSlot.findMany({
      where: {
        specialistId,
        isRecurring: true,
        isAvailable: true,
      },
    });

    // Get existing bookings to check conflicts
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        specialistId,
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        slotStart: { gte: fromDate, lte: toDate },
      },
      select: { slotStart: true, slotEnd: true },
    });

    // Generate concrete slots from recurring pattern
    const slots: Record<string, { start: string; end: string; available: boolean }[]> = {};

    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dayOfWeek = (currentDate.getDay() + 6) % 7; // Convert to Mon=0
      const dateStr = currentDate.toISOString().split('T')[0];

      const daySlots = recurringSlots.filter(
        (s) => s.dayOfWeek === dayOfWeek,
      );

      if (daySlots.length > 0) {
        slots[dateStr] = daySlots.map((s) => {
          // Check if this slot conflicts with an existing booking
          const slotStartDate = new Date(`${dateStr}T${s.startTime}:00`);
          const slotEndDate = new Date(`${dateStr}T${s.endTime}:00`);

          const isBooked = existingBookings.some(
            (b) => b.slotStart < slotEndDate && b.slotEnd > slotStartDate,
          );

          return {
            start: s.startTime!,
            end: s.endTime!,
            available: !isBooked && slotStartDate > new Date(),
          };
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      specialistId,
      timezone,
      slots: Object.entries(slots).map(([date, times]) => ({ date, times })),
    };
  }
}
