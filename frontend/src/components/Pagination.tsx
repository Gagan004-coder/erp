interface Props {
  current: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ current, total, onPageChange }: Props) {
  if (total <= 1) return null;

  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - current) <= 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
      >
        ‹ Prev
      </button>

      {visible.map((page, idx) => {
        const prev = visible[idx - 1];
        return (
          <span key={page} className="flex items-center gap-1">
            {prev && page - prev > 1 && <span className="text-gray-500 px-1">…</span>}
            <button
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === current
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:bg-surface-600 hover:text-white'
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
      >
        Next ›
      </button>
    </div>
  );
}
