import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiChatService } from './ai-chat.service';
import { LlmService } from './llm.service';
import { AiChatGateway } from './ai-chat.gateway';
import { ValueExtractionService } from './value-extraction.service';
import { CrisisDetectorService } from './crisis-detector.service';
import { ValueProfileModule } from '../value-profile/value-profile.module';

@Module({
  imports: [ValueProfileModule],
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
