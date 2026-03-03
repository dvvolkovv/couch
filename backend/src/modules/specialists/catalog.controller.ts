import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/specialist.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get('specialists')
  @ApiOperation({ summary: 'Search and filter specialists' })
  async searchSpecialists(@Query() query: CatalogQueryDto) {
    return this.catalogService.search(query);
  }

  @Public()
  @Get('specializations')
  @ApiOperation({ summary: 'Get available specializations and approaches' })
  async getSpecializations() {
    return this.catalogService.getSpecializations();
  }
}
