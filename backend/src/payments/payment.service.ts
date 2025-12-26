import { Inject, Injectable } from '@nestjs/common';
import { IPaymentGateway, PaymentResult, RefundResult, TransactionStatus } from './ipayment-gateway';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('IPaymentGateway') private readonly gateway: IPaymentGateway,
  ) {}

  async charge(amount: number, currency: string, customerId: string): Promise<PaymentResult> {
    return this.gateway.charge(amount, currency, customerId);
  }

  // Convenience wrapper for subscription checkout flows that work with priceId
  async createCheckout(userId: string, priceId: string) {
    // Some adapters (StripeAdapter) expect priceId in place of amount for compatibility with existing code.
    return this.gateway.charge(priceId as unknown as number, 'USD', userId);
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    return this.gateway.refund(transactionId, amount);
  }

  async getStatus(transactionId: string): Promise<TransactionStatus> {
    return this.gateway.getStatus(transactionId);
  }
}
