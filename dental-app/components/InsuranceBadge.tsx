import { InsuranceType } from '@/lib/types';

interface Props {
  type: InsuranceType;
}

const colorMap: Record<InsuranceType, string> = {
  '社保': 'bg-blue-100 text-blue-700',
  '国保': 'bg-purple-100 text-purple-700',
  '自費': 'bg-gray-100 text-gray-700',
};

export default function InsuranceBadge({ type }: Props) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colorMap[type]}`}>
      {type}
    </span>
  );
}
