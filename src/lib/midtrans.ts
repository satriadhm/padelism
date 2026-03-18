import crypto from 'crypto';

interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

interface MidtransCustomerDetails {
  first_name: string;
  email: string;
  phone: string;
}

interface MidtransSnapParams {
  transaction_details: MidtransTransactionDetails;
  customer_details: MidtransCustomerDetails;
  expiry: { unit: string; duration: number };
}

export async function createSnapToken(params: MidtransSnapParams): Promise<{ token: string; redirect_url: string }> {
  // Dynamic import to avoid client-side bundling
  const midtransClient = await import('midtrans-client');
  const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  });

  return await snap.createTransaction(params as unknown as Record<string, unknown>);
}

export function verifyWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const hash = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex');
  return hash === signatureKey;
}
