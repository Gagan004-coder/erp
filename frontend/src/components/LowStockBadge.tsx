interface Props {
  current: number;
  minimum: number;
}

export default function LowStockBadge({ current, minimum }: Props) {
  if (current === 0) return <span className="badge-red">Out of Stock</span>;
  if (current <= minimum) return <span className="badge-yellow">Low Stock</span>;
  return <span className="badge-green">In Stock</span>;
}
