import { Injectable, Logger } from '@nestjs/common';
import { IPaymentGateway, PaymentResult, RefundResult, TransactionStatus } from './ipayment-gateway';
import { StripeService } from '../subscription/stripe.service';

@Injectable()
export class StripeAdapter implements IPaymentGateway {
  private readonly logger = new Logger(StripeAdapter.name);
  constructor(private stripeService: StripeService) {}

  async charge(amount: number, currency: string, customerId: string): Promise<PaymentResult> {
    try {
      // For now map to checkout session creation where amount is represented by priceId in existing code.
      // This adapter assumes higher-level code will pass priceId via customerId for compatibility,
      // or you can extend signature later. We'll support checkout via stripeService.createCheckoutSession
      const session = await this.stripeService.createCheckoutSession(customerId, String(amount));
      return { success: true, transactionId: session.id, data: session } as PaymentResult;
    } catch (e: any) {
      this.logger.error('Stripe charge error', e?.message || e);
      return { success: false, error: e?.message || String(e) } as PaymentResult;
    }
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    try {
      // Stripe refund flow omitted — return placeholder
      return { success: true, refundId: `refund_${transactionId}` } as RefundResult;
    } catch (e: any) {
      this.logger.error('Stripe refund error', e?.message || e);
      return { success: false, error: e?.message || String(e) } as RefundResult;
    }
  }

  async getStatus(transactionId: string): Promise<TransactionStatus> {
    // Best-effort mapping via StripeService (not implemented as direct call here)
    return 'UNKNOWN';
  }
}
