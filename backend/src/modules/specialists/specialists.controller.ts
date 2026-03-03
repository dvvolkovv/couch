import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SpecialistsService } from './specialists.service';
import { ApplySpecialistDto, UpdateSpecialistDto } from './dto/specialist.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Specialists')
@Controller('specialists')
export class SpecialistsController {
  constructor(private readonly specialistsService: SpecialistsService) {}

  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply as a specialist' })
  async apply(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ApplySpecialistDto,
  ) {
    return this.specialistsService.apply(user.sub, dto);
  }

  @Get('me')
  @Roles('SPECIALIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own specialist profile' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.specialistsService.getMe(user.sub);
  }

  @Patch('me')
  @Roles('SPECIALIST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update specialist profile' })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateSpecialistDto,
  ) {
    return this.specialistsService.updateMe(user.sub, dto);
  }

  @Post('me/video-intro')
  @Roles('SPECIALIST')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('video'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload video intro' })
  async uploadVideoIntro(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // In production, upload to S3 and trigger transcoding
    return {
      status: 'processing',
      message:
        'Video uploaded. It will appear in your profile after transcoding and moderation.',
    };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public specialist profile' })
  async getPublicProfile(@Param('id') id: string) {
    return this.specialistsService.getPublicProfile(id);
  }
}
