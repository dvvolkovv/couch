import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiChatService } from './ai-chat.service';
import { LlmService } from './llm.service';
import { AiChatGateway } from './ai-chat.gateway';
import { ValueExtractionService } from './value-extraction.service';
import { CrisisDetectorService } from './crisis-detector.service';
import { ValueProfileModule } from '../value-profile/value-profile.module';

@Module({
  imports: [
    ValueProfileModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AiController],
  providers: [
    AiChatService,
    LlmService,
    AiChatGateway,
    ValueExtractionService,
    CrisisDetectorService,
  ],
  exports: [AiChatService, LlmService],
})
export class AiModule {}
