import { Module } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { ScoringService } from './scoring.service';
import { ValueProfileModule } from '../value-profile/value-profile.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ValueProfileModule, AiModule],
  controllers: [MatchingController],
  providers: [MatchingService, ScoringService],
  exports: [MatchingService],
})
export class MatchingModule {}
