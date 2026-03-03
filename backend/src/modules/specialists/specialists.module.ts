import { Module } from '@nestjs/common';
import { SpecialistsController } from './specialists.controller';
import { SpecialistsService } from './specialists.service';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [SpecialistsController, CatalogController],
  providers: [SpecialistsService, CatalogService],
  exports: [SpecialistsService, CatalogService],
})
export class SpecialistsModule {}
