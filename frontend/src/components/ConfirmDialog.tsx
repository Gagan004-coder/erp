interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmClassName?: string;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure? This action cannot be undone.',
  confirmLabel = 'Confirm',
  confirmClassName = 'btn-danger',
  isLoading = false,
}: Props) {
  return (
    <div className="modal-overlay">
      <div className="card w-full max-w-sm p-6 animate-fade-in">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-400">{message}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex-1" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className={`btn ${confirmClassName} flex-1`} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
