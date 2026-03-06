import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';

// Build safe CORS origin list: wildcard '*' is incompatible with credentials:true,
// so fall back to a permissive function that accepts all origins in that edge case.
const _rawOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [];
const _wsOrigin: string | string[] | ((origin: string, cb: (err: any, allow?: boolean) => void) => void) =
  _rawOrigins.length === 0 || _rawOrigins.includes('*')
    ? (origin, cb) => cb(null, true)
    : _rawOrigins;

@WebSocketGateway({
  namespace: 'messages',
  cors: {
    origin: _wsOrigin,
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private readonly connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token as string;

      if (!token) {
        client.emit('error', { code: 'UNAUTHORIZED', message: 'Token required' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      this.connectedUsers.set(client.id, payload.sub);
      this.logger.log(
        `Messages client connected: ${client.id} (user: ${payload.sub})`,
      );
    } catch (error) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.logger.log(`Messages client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_thread')
  async handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    // Verify thread belongs to user by trying to get it
    try {
      await this.messagesService.getThread(userId, data.threadId);
    } catch {
      client.emit('error', {
        code: 'FORBIDDEN',
        message: 'Not authorized for this thread',
      });
      return;
    }

    await client.join(`thread:${data.threadId}`);
    this.logger.log(`User ${userId} joined thread ${data.threadId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string; content: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    if (!data.content || data.content.trim().length === 0) {
      client.emit('error', {
        code: 'VALIDATION_ERROR',
        message: 'Message content is required',
      });
      return;
    }

    try {
      const message = await this.messagesService.sendMessage(
        userId,
        data.threadId,
        { content: data.content.trim() },
      );

      // Broadcast to all clients in the thread room
      this.server.to(`thread:${data.threadId}`).emit('new_message', {
        threadId: data.threadId,
        message,
      });
    } catch (error: any) {
      this.logger.error(
        `Error sending message in thread ${data.threadId}: ${error.message}`,
      );
      client.emit('error', {
        code: 'SEND_ERROR',
        message: 'Failed to send message',
      });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.to(`thread:${data.threadId}`).emit('typing', {
      threadId: data.threadId,
      userId,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    try {
      await this.messagesService.markThreadAsRead(userId, data.threadId);
      // Notify other participants that messages were read
      client.to(`thread:${data.threadId}`).emit('messages_read', {
        threadId: data.threadId,
        readBy: userId,
      });
    } catch (error: any) {
      this.logger.error(`Error marking thread read: ${error.message}`);
    }
  }
}
