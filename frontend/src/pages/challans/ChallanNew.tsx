import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';
import { challanService } from '../../services/challanService';
import { Customer, Product } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

interface LineItem {
  product_id: string;
  quantity: number;
  product?: Product;
}

export default function ChallanNew() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ product_id: '', quantity: 1 }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      customerService.getAll({ limit: '100', status: 'ACTIVE' }),
      productService.getAll({ limit: '100' }),
    ]).then(([c, p]) => {
      setCustomers(c.data);
      setProducts(p.data);
    }).finally(() => setIsFetching(false));
  }, []);

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }]);

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'product_id') {
        updated.product = products.find(p => p.id === value);
      }
      return updated;
    }));
  };

  const totalQty = items.reduce((s, i) => s + Number(i.quantity || 0), 0);

  const usedProductIds = items.map(i => i.product_id).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error('Please select a customer'); return; }
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) { toast.error('Add at least one product'); return; }

    setIsLoading(true);
    try {
      const challan = await challanService.create({
        customer_id: customerId,
        items: validItems.map(i => ({ product_id: i.product_id, quantity: Number(i.quantity) })),
      });
      toast.success(`Challan ${challan.challan_number} created`);
      navigate(`/challans/${challan.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create challan';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <LoadingSpinner text="Loading data..." />;

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Challan</h1>
          <p className="page-subtitle">Create a draft sales challan</p>
        </div>
      </div>

      <form id="challan-form" onSubmit={handleSubmit}>
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Customer</h2>
          <select
            id="challan-customer"
            className="select w-full max-w-md"
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.customer_name} {c.business_name ? `— ${c.business_name}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Products</h2>
            <button type="button" id="add-item-btn" className="btn btn-secondary btn-sm" onClick={addItem}>
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const selectedProduct = products.find(p => p.id === item.product_id);
              const availableProducts = products.filter(p => !usedProductIds.includes(p.id) || p.id === item.product_id);

              return (
                <div key={idx} className="grid grid-cols-12 gap-3 items-start p-3 bg-surface-700 rounded-lg">
                  <div className="col-span-6">
                    <label className="label">Product</label>
                    <select
                      id={`item-product-${idx}`}
                      className="select"
                      value={item.product_id}
                      onChange={e => updateItem(idx, 'product_id', e.target.value)}
                      required
                    >
                      <option value="">Select product...</option>
                      {availableProducts.map(p => (
                        <option key={p.id} value={p.id} disabled={p.current_stock === 0}>
                          {p.product_name} (Stock: {p.current_stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="label">Qty</label>
                    <input
                      id={`item-qty-${idx}`}
                      type="number"
                      min={1}
                      max={selectedProduct?.current_stock ?? 9999}
                      className="input"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="label">Unit Price</label>
                    <div className="input bg-surface-600 text-gray-400 cursor-default">
                      {selectedProduct ? `₹${Number(selectedProduct.unit_price).toLocaleString()}` : '—'}
                    </div>
                  </div>

                  <div className="col-span-1 pt-6">
                    {items.length > 1 && (
                      <button
                        type="button"
                        id={`remove-item-${idx}`}
                        className="btn btn-danger btn-sm w-full justify-center"
                        onClick={() => removeItem(idx)}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {selectedProduct && (
                    <div className="col-span-12">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>SKU: {selectedProduct.sku}</span>
                        <span>Available: {selectedProduct.current_stock}</span>
                        {selectedProduct.current_stock < item.quantity && (
                          <span className="text-red-400 font-medium">⚠️ Insufficient stock</span>
                        )}
                        {selectedProduct.warehouse_location && <span>📍 {selectedProduct.warehouse_location}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-surface-600">
            <div className="text-sm text-gray-400">
              {items.filter(i => i.product_id).length} product{items.filter(i => i.product_id).length !== 1 ? 's' : ''} selected
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Quantity</p>
              <p className="text-2xl font-bold text-white">{totalQty}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/challans')}>Cancel</button>
          <button id="challan-submit" type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
