import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateThreadDto, SendMessageDto } from './dto/messages.dto';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('threads')
  @ApiOperation({ summary: 'Get user message threads' })
  async getThreads(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getThreads(user.sub);
  }

  @Get('threads/:threadId')
  @ApiOperation({ summary: 'Get thread with messages' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getThread(
    @CurrentUser() user: JwtPayload,
    @Param('threadId') threadId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.getThread(
      user.sub,
      threadId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Post('threads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new message thread' })
  async createThread(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateThreadDto,
  ) {
    return this.messagesService.createThread(user.sub, dto);
  }

  @Post('threads/:threadId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message in thread' })
  async sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('threadId') threadId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.sub, threadId, dto);
  }

  @Patch('threads/:threadId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark thread messages as read' })
  async markThreadAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('threadId') threadId: string,
  ) {
    return this.messagesService.markThreadAsRead(user.sub, threadId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread messages count' })
  async getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getTotalUnreadCount(user.sub);
  }
}
