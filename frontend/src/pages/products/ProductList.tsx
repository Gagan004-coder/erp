import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { Product, PaginatedResult } from '../../types';
import LowStockBadge from '../../components/LowStockBadge';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

export default function ProductList() {
  const { user } = useAuth();
  const [result, setResult] = useState<PaginatedResult<Product> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (category) params.category = category;
      const data = await productService.getAll(params);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { productService.getCategories().then(setCategories); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await productService.delete(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{result?.total ?? 0} total products</p>
        </div>
        {canEdit && (
          <Link to="/products/new" id="add-product-btn" className="btn btn-primary">
            + Add Product
          </Link>
        )}
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput
          id="product-search"
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search name or SKU..."
        />
        <select
          id="category-filter"
          className="select w-full sm:w-48"
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8}><LoadingSpinner /></td></tr>
            ) : result?.data.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">No products found</td></tr>
            ) : result?.data.map(p => (
              <tr key={p.id}>
                <td>
                  <Link to={`/products/${p.id}`} className="text-brand-400 hover:text-brand-300 font-medium">
                    {p.product_name}
                  </Link>
                </td>
                <td className="font-mono text-xs text-gray-400">{p.sku}</td>
                <td className="text-gray-400">{p.category}</td>
                <td className="font-medium">₹{Number(p.unit_price).toLocaleString()}</td>
                <td>
                  <span className={`font-semibold ${p.current_stock <= p.minimum_stock ? 'text-amber-400' : 'text-gray-200'}`}>
                    {p.current_stock}
                  </span>
                  <span className="text-gray-500 text-xs"> / {p.minimum_stock} min</span>
                </td>
                <td><LowStockBadge current={p.current_stock} minimum={p.minimum_stock} /></td>
                <td className="text-gray-400 text-xs">{p.warehouse_location ?? '—'}</td>
                <td>
                  <div className="flex gap-1.5">
                    <Link to={`/products/${p.id}`} className="btn btn-ghost btn-sm">View</Link>
                    {canEdit && (
                      <>
                        <Link to={`/products/${p.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        {user?.role === 'ADMIN' && (
                          <button
                            id={`delete-product-${p.id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteId(p.id)}
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && <Pagination current={page} total={result.totalPages} onPageChange={setPage} />}

      {deleteId && (
        <ConfirmDialog
          title="Delete Product"
          message="This will permanently delete the product. Continue?"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
