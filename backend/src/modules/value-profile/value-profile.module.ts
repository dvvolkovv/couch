import { Module } from '@nestjs/common';
import { ValueProfileController } from './value-profile.controller';
import { ValueProfileService } from './value-profile.service';
import { EmbeddingService } from './embedding.service';

@Module({
  controllers: [ValueProfileController],
  providers: [ValueProfileService, EmbeddingService],
  exports: [ValueProfileService, EmbeddingService],
})
export class ValueProfileModule {}
