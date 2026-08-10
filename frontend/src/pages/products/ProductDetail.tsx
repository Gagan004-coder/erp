import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import LowStockBadge from '../../components/LowStockBadge';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productService.getById(id!).then(setProduct).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingSpinner text="Loading product..." />;
  if (!product) return <div className="text-gray-400">Product not found</div>;

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/products" className="hover:text-gray-300">Products</Link>
            <span>/</span>
            <span className="text-gray-300">{product.product_name}</span>
          </div>
          <h1 className="page-title">{product.product_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs text-gray-400 bg-surface-700 px-2 py-0.5 rounded">{product.sku}</span>
            <LowStockBadge current={product.current_stock} minimum={product.minimum_stock} />
          </div>
        </div>
        {canEdit && (
          <Link to={`/products/${id}/edit`} className="btn btn-secondary">Edit Product</Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Current Stock</p>
          <p className={`text-4xl font-bold ${product.current_stock <= product.minimum_stock ? 'text-amber-400' : 'text-white'}`}>
            {product.current_stock}
          </p>
          <p className="text-xs text-gray-500 mt-1">Min: {product.minimum_stock}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Unit Price</p>
          <p className="text-3xl font-bold text-white">₹{Number(product.unit_price).toLocaleString()}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Category</p>
          <p className="text-xl font-semibold text-white mt-2">{product.category}</p>
          <p className="text-xs text-gray-500 mt-1">{product.warehouse_location ?? 'No location'}</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Stock Movement History</h2>
        {!product.stock_movements?.length ? (
          <p className="text-gray-500 text-sm text-center py-4">No stock movements yet</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {product.stock_movements.map(m => (
                  <tr key={m.id}>
                    <td className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</td>
                    <td><StatusBadge status={m.type} /></td>
                    <td className={`font-semibold ${m.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.type === 'IN' ? '+' : '-'}{m.quantity}
                    </td>
                    <td className="text-gray-400">{m.reason}</td>
                    <td className="text-gray-400 text-xs">{(m as { user?: { name: string } }).user?.name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
