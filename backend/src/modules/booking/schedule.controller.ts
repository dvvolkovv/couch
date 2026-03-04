import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { UpdateScheduleDto } from './dto/booking.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Schedule')
@ApiBearerAuth()
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('me')
  @ApiOperation({ summary: "Get specialist's schedule" })
  async getMySchedule(@CurrentUser() user: JwtPayload) {
    return this.scheduleService.getMySchedule(user.sub);
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update schedule (full replacement)' })
  async updateSchedule(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.scheduleService.updateSchedule(user.sub, dto);
  }
}
