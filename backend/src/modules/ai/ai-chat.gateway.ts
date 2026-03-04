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
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AiChatService } from './ai-chat.service';

/**
 * WebSocket gateway for AI chat interactions.
 * Handles real-time message streaming between client and AI.
 *
 * Namespace: /ai-chat
 *
 * Client -> Server events:
 *   join_conversation: { conversationId }
 *   send_message: { conversationId, content }
 *   typing: { conversationId }
 *
 * Server -> Client events:
 *   ai_stream_start: { conversationId, messageId }
 *   ai_stream_token: { conversationId, messageId, token }
 *   ai_stream_end: { conversationId, messageId, fullContent }
 *   phase_changed: { conversationId, phase }
 *   summary_ready: { conversationId, summary }
 *   crisis_detected: { conversationId, emergencyInfo }
 *   error: { code, message }
 */
@WebSocketGateway({
  namespace: 'ai-chat',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
export class AiChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AiChatGateway.name);
  private readonly connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly aiChatService: AiChatService,
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
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch (error) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    // Verify conversation belongs to user
    try {
      await this.aiChatService.getConsultation(userId, data.conversationId);
    } catch {
      client.emit('error', { code: 'FORBIDDEN', message: 'Not authorized for this conversation' });
      return;
    }

    // Join the room for this conversation
    await client.join(`conversation:${data.conversationId}`);
    this.logger.log(
      `User ${userId} joined conversation ${data.conversationId}`,
    );
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
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

    const room = `conversation:${data.conversationId}`;

    try {
      // Emit stream start
      const tempMessageId = `msg_${Date.now()}`;
      this.server.to(room).emit('ai_stream_start', {
        conversationId: data.conversationId,
        messageId: tempMessageId,
      });

      // Process message with streaming
      const result = await this.aiChatService.processMessage(
        userId,
        data.conversationId,
        data.content,
        (token: string) => {
          this.server.to(room).emit('ai_stream_token', {
            conversationId: data.conversationId,
            messageId: tempMessageId,
            token,
          });
        },
      );

      // Emit stream end
      this.server.to(room).emit('ai_stream_end', {
        conversationId: data.conversationId,
        messageId: result.messageId,
        fullContent: result.content,
      });

      // Emit phase change if applicable
      if (result.phaseChanged) {
        this.server.to(room).emit('phase_changed', {
          conversationId: data.conversationId,
          phase: result.phase,
        });
      }

      // Emit crisis detection
      if (result.isCrisis) {
        this.server.to(room).emit('crisis_detected', {
          conversationId: data.conversationId,
          emergencyInfo: {
            hotline: '8-800-2000-122',
            emergencyLine: '112',
          },
        });
      }

      // Emit summary if conversation is complete
      if (result.isComplete && result.extractedProfile) {
        this.server.to(room).emit('summary_ready', {
          conversationId: data.conversationId,
          summary: result.extractedProfile,
        });
      }
    } catch (error: any) {
      this.logger.error(
        `Error processing message in conversation ${data.conversationId}: ${error.message}`,
      );
      client.emit('error', {
        code: 'PROCESSING_ERROR',
        message: 'Failed to process message. Please try again.',
      });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.to(`conversation:${data.conversationId}`).emit('typing', {
      conversationId: data.conversationId,
      userId,
    });
  }
}
