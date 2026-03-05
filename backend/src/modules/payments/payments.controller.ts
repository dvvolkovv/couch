import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get payment history' })
  async getPayments(@CurrentUser() user: JwtPayload) {
    return this.paymentsService.getPayments(user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payment' })
  async createPayment(
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    return this.paymentsService.createPayment(user.sub, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async getPayment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.paymentsService.getPayment(user.sub, id);
  }
}
