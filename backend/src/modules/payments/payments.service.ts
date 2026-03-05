import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPayments(userId: string) {
    return {
      data: [],
      total: 0,
    };
  }

  async createPayment(userId: string, body: any) {
    return {
      id: 'stub-payment-id',
      status: 'PENDING',
      message: 'Payment processing not yet implemented',
    };
  }

  async getPayment(userId: string, paymentId: string) {
    return {
      id: paymentId,
      status: 'UNKNOWN',
      message: 'Payment lookup not yet implemented',
    };
  }
}
