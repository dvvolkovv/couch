import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { ScheduleService } from './schedule.service';
import { CreateBookingDto, CancelBookingDto, SlotsQueryDto } from './dto/booking.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a booking' })
  async createBooking(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my bookings' })
  async listBookings(@CurrentUser() user: JwtPayload) {
    return this.bookingService.listBookings(user.sub, user.role);
  }

  @Get('slots/:specialistId')
  @ApiOperation({ summary: 'Get available slots for a specialist' })
  async getSlots(
    @Param('specialistId') specialistId: string,
    @Query() query: SlotsQueryDto,
  ) {
    return this.scheduleService.getAvailableSlots(
      specialistId,
      query.from || '',
      query.to || '',
      query.timezone,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  async getBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.bookingService.getBooking(user.sub, id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancelBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingService.cancelBooking(user.sub, id, dto);
  }
}
