import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [BookingController, ScheduleController],
  providers: [BookingService, ScheduleService],
  exports: [BookingService, ScheduleService],
})
export class BookingModule {}
