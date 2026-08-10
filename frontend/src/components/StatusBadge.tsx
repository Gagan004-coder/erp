import { ChallanStatus, CustomerStatus, StockMovementType } from '../types';

interface Props {
  status: ChallanStatus | CustomerStatus | StockMovementType | string;
}

const map: Record<string, string> = {
  ACTIVE: 'badge-green',
  CONFIRMED: 'badge-green',
  IN: 'badge-green',
  LEAD: 'badge-yellow',
  DRAFT: 'badge-yellow',
  INACTIVE: 'badge-gray',
  CANCELLED: 'badge-gray',
  OUT: 'badge-red',
  ADMIN: 'badge-purple',
  SALES: 'badge-blue',
  WAREHOUSE: 'badge-yellow',
  ACCOUNTS: 'badge-gray',
  RETAIL: 'badge-blue',
  WHOLESALE: 'badge-purple',
  DISTRIBUTOR: 'badge-green',
};

export default function StatusBadge({ status }: Props) {
  const cls = map[status] ?? 'badge-gray';
  return <span className={cls}>{status}</span>;
}
