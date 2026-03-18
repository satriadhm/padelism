import Card from '@/components/ui/Card';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

export interface BookingSummaryProps {
  courtName: string;
  venueName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  paymentMethod: string;
  totalPrice: number;
  className?: string;
}

export default function BookingSummary({
  courtName,
  venueName,
  date,
  startTime,
  endTime,
  durationMinutes,
  paymentMethod,
  totalPrice,
  className,
}: BookingSummaryProps) {
  const paymentLabel = paymentMethod === 'cash' ? 'Bayar di Tempat' : 'Transfer Online (Midtrans)';

  return (
    <Card className={className}>
      <h3 className="mb-3 text-lg font-semibold text-gray-900">Ringkasan Booking</h3>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Lapangan</dt>
          <dd className="font-medium text-gray-900">{courtName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Venue</dt>
          <dd className="font-medium text-gray-900">{venueName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Tanggal</dt>
          <dd className="font-medium text-gray-900">{formatDate(date)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Waktu</dt>
          <dd className="font-medium text-gray-900">
            {formatTime(startTime)} – {formatTime(endTime)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Durasi</dt>
          <dd className="font-medium text-gray-900">{durationMinutes} menit</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Pembayaran</dt>
          <dd className="font-medium text-gray-900">{paymentLabel}</dd>
        </div>

        <hr className="my-2 border-gray-200" />

        <div className="flex justify-between">
          <dt className="text-base font-semibold text-gray-900">Total</dt>
          <dd className="text-base font-semibold text-[var(--color-brand-700)]">
            {formatCurrency(totalPrice)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
