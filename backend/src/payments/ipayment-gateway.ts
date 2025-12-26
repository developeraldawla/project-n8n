export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  data?: any;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'UNKNOWN';

export interface IPaymentGateway {
  charge(amount: number, currency: string, customerId: string): Promise<PaymentResult>;
  refund(transactionId: string, amount?: number): Promise<RefundResult>;
  getStatus(transactionId: string): Promise<TransactionStatus>;
}
