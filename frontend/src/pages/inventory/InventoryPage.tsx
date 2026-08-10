import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import { StockMovement, Product, PaginatedResult } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

export default function InventoryPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<PaginatedResult<StockMovement> | null>(null);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    product_id: string; quantity: number; type: 'IN' | 'OUT'; reason: string;
  }>();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [movements, low] = await Promise.all([
        inventoryService.getMovements({ page: String(page), limit: '15' }),
        inventoryService.getLowStock(),
      ]);
      setResult(movements);
      setLowStock(low);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    productService.getAll({ limit: '100' }).then(r => setProducts(r.data));
  }, []);

  const onSubmit = async (data: { product_id: string; quantity: number; type: 'IN' | 'OUT'; reason: string }) => {
    setIsSubmitting(true);
    try {
      await inventoryService.createMovement({ ...data, quantity: Number(data.quantity) });
      toast.success('Stock movement recorded');
      reset();
      setShowModal(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to record movement';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Stock movements and warehouse overview</p>
        </div>
        {canEdit && (
          <button id="add-movement-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Record Movement
          </button>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="card p-4 mb-4 border-amber-500/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400">⚠️</span>
            <h2 className="text-sm font-semibold text-amber-400">Low Stock Alert — {lowStock.length} item{lowStock.length > 1 ? 's' : ''}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStock.map((p: Product) => (
              <Link key={p.id} to={`/products/${p.id}`} className="flex items-center justify-between p-2.5 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors">
                <div>
                  <p className="text-sm text-white font-medium">{p.product_name}</p>
                  <p className="text-xs text-gray-400">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold">{p.current_stock}</p>
                  <p className="text-xs text-gray-500">min {p.minimum_stock}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-surface-600">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Stock Movement Log</h2>
        </div>
        <div className="table-container rounded-t-none border-0">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7}><LoadingSpinner /></td></tr>
              ) : result?.data.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-8">No movements recorded</td></tr>
              ) : result?.data.map(m => (
                <tr key={m.id}>
                  <td className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="text-sm font-medium">{m.product?.product_name}</td>
                  <td className="font-mono text-xs text-gray-500">{m.product?.sku}</td>
                  <td><StatusBadge status={m.type} /></td>
                  <td className={`font-bold ${m.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {m.type === 'IN' ? '+' : '-'}{m.quantity}
                  </td>
                  <td className="text-gray-400 text-sm">{m.reason}</td>
                  <td className="text-gray-500 text-xs">{m.user?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {result && <Pagination current={page} total={result.totalPages} onPageChange={setPage} />}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Stock Movement">
        <form id="movement-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Product *</label>
            <select id="movement-product" className="select" {...register('product_id', { required: true })}>
              <option value="">Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.product_name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div>
              <label className="label">Type *</label>
              <select id="movement-type" className="select" {...register('type', { required: true })}>
                <option value="IN">IN (Receiving)</option>
                <option value="OUT">OUT (Dispatch)</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input id="movement-qty" type="number" min={1} className="input" {...register('quantity', { required: true, min: 1 })} />
            </div>
          </div>
          <div>
            <label className="label">Reason *</label>
            <input id="movement-reason" className="input" placeholder="e.g. Purchase, Damaged goods..." {...register('reason', { required: true })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button id="movement-submit" type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Movement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
