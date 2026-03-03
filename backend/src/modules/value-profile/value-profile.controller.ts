import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ValueProfileService } from './value-profile.service';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Value Profile')
@Controller('value-profile')
export class ValueProfileController {
  constructor(private readonly valueProfileService: ValueProfileService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my value profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.valueProfileService.getMyProfile(user.sub);
  }

  @Public()
  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Get specialist public value profile' })
  async getSpecialistProfile(@Param('specialistId') specialistId: string) {
    return this.valueProfileService.getSpecialistProfile(specialistId);
  }
}
