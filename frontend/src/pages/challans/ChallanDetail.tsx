import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { challanService } from '../../services/challanService';
import { Challan } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

export default function ChallanDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'cancel' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const load = () => {
    challanService.getById(id!).then(setChallan).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      if (confirmAction === 'confirm') {
        await challanService.confirm(id!);
        toast.success('Challan confirmed — stock updated');
      } else {
        await challanService.cancel(id!);
        toast.success('Challan cancelled');
      }
      setConfirmAction(null);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Action failed';
      toast.error(msg);
      setConfirmAction(null);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading challan..." />;
  if (!challan) return <div className="text-gray-400">Challan not found</div>;

  const canAct = (user?.role === 'ADMIN' || user?.role === 'SALES') && challan.status === 'DRAFT';

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/challans" className="hover:text-gray-300">Challans</Link>
            <span>/</span>
            <span className="font-mono text-gray-300">{challan.challan_number}</span>
          </div>
          <h1 className="page-title font-mono">{challan.challan_number}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={challan.status} />
            <span className="text-xs text-gray-500">Created by {challan.creator?.name}</span>
          </div>
        </div>

        {canAct && (
          <div className="flex gap-2">
            <button
              id="confirm-challan-btn"
              className="btn btn-success"
              onClick={() => setConfirmAction('confirm')}
            >
              ✓ Confirm Challan
            </button>
            <button
              id="cancel-challan-btn"
              className="btn btn-danger"
              onClick={() => setConfirmAction('cancel')}
            >
              ✕ Cancel
            </button>
          </div>
        )}
      </div>

      {challan.status === 'DRAFT' && (
        <div className="card p-3 mb-4 border-amber-500/30 bg-amber-500/5 flex items-center gap-2">
          <span className="text-amber-400">ℹ️</span>
          <p className="text-sm text-amber-300">This challan is a DRAFT. Confirming will deduct stock and create OUT movements atomically.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Customer</h2>
          <p className="text-white font-semibold">{challan.customer?.customer_name}</p>
          {challan.customer?.business_name && (
            <p className="text-gray-400 text-sm">{challan.customer.business_name}</p>
          )}
          <Link to={`/customers/${challan.customer_id}`} className="text-xs text-brand-400 hover:text-brand-300 mt-1 inline-block">
            View customer →
          </Link>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Summary</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Date</dt>
              <dd className="text-sm text-gray-200">{new Date(challan.created_at).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Total Qty</dt>
              <dd className="text-2xl font-bold text-white">{challan.total_quantity}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Items</dt>
              <dd className="text-sm text-gray-200">{challan.items?.length ?? 0}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Line Items (Snapshot)</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                {challan.status === 'DRAFT' && <th>Current Stock</th>}
              </tr>
            </thead>
            <tbody>
              {challan.items?.map(item => {
                const stockWarning = challan.status === 'DRAFT' && item.product && item.product.current_stock < item.quantity;
                return (
                  <tr key={item.id} className={stockWarning ? 'bg-red-500/5' : ''}>
                    <td className="font-medium">{item.product_name}</td>
                    <td className="font-mono text-xs text-gray-400">{item.sku}</td>
                    <td>₹{Number(item.unit_price).toLocaleString()}</td>
                    <td className="font-semibold">{item.quantity}</td>
                    {challan.status === 'DRAFT' && (
                      <td>
                        {item.product ? (
                          <span className={item.product.current_stock < item.quantity ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
                            {item.product.current_stock}
                            {item.product.current_stock < item.quantity && ' ⚠️'}
                          </span>
                        ) : '—'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4 border-t border-surface-600 mt-2">
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Total Quantity</p>
            <p className="text-3xl font-bold text-white">{challan.total_quantity}</p>
          </div>
        </div>
      </div>

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction === 'confirm' ? 'Confirm Challan' : 'Cancel Challan'}
          message={
            confirmAction === 'confirm'
              ? 'This will deduct stock for all items in an atomic transaction. This cannot be undone.'
              : 'This will cancel the challan. Stock will NOT be affected.'
          }
          confirmLabel={confirmAction === 'confirm' ? 'Confirm & Deduct Stock' : 'Cancel Challan'}
          confirmClassName={confirmAction === 'confirm' ? 'btn-success' : 'btn-danger'}
          onConfirm={handleAction}
          onCancel={() => setConfirmAction(null)}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
}
