import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { customerService } from '../../services/customerService';
import { Customer, PaginatedResult } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

export default function CustomerList() {
  const { user } = useAuth();
  const [result, setResult] = useState<PaginatedResult<Customer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customer_type = typeFilter;
      const data = await customerService.getAll(params);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await customerService.delete(deleteId);
      toast.success('Customer deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{result?.total ?? 0} total customers</p>
        </div>
        {canEdit && (
          <Link to="/customers/new" id="add-customer-btn" className="btn btn-primary">
            + Add Customer
          </Link>
        )}
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput
          id="customer-search"
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search name, mobile, email..."
        />
        <select
          id="status-filter"
          className="select w-full sm:w-40"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select
          id="type-filter"
          className="select w-full sm:w-44"
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Mobile</th>
              <th>Type</th>
              <th>Status</th>
              <th>Follow Up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7}><LoadingSpinner /></td></tr>
            ) : result?.data.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-500 py-8">No customers found</td></tr>
            ) : result?.data.map(c => (
              <tr key={c.id}>
                <td>
                  <Link to={`/customers/${c.id}`} className="text-brand-400 hover:text-brand-300 font-medium">
                    {c.customer_name}
                  </Link>
                </td>
                <td className="text-gray-400">{c.business_name ?? '—'}</td>
                <td>{c.mobile}</td>
                <td><StatusBadge status={c.customer_type} /></td>
                <td><StatusBadge status={c.status} /></td>
                <td className="text-gray-400 text-xs">
                  {c.follow_up_date ? new Date(c.follow_up_date).toLocaleDateString() : '—'}
                </td>
                <td>
                  <div className="flex gap-1.5">
                    <Link to={`/customers/${c.id}`} className="btn btn-ghost btn-sm">View</Link>
                    {canEdit && (
                      <>
                        <Link to={`/customers/${c.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        {user?.role === 'ADMIN' && (
                          <button
                            id={`delete-customer-${c.id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteId(c.id)}
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

      {result && (
        <Pagination current={page} total={result.totalPages} onPageChange={setPage} />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Customer"
          message="This will permanently delete the customer and all their followups. Continue?"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
