import { InvoiceStatus } from '@/lib/types';

interface Props {
  status: InvoiceStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
        status === 'paid'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {status === 'paid' ? '支払済み' : '未払い'}
    </span>
  );
}
