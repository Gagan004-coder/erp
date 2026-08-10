import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { challanService } from '../../services/challanService';
import { Challan, PaginatedResult } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export default function ChallanList() {
  const { user } = useAuth();
  const [result, setResult] = useState<PaginatedResult<Challan> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (statusFilter) params.status = statusFilter;
      const data = await challanService.getAll(params);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Challans</h1>
          <p className="page-subtitle">{result?.total ?? 0} total challans</p>
        </div>
        {canCreate && (
          <Link to="/challans/new" id="new-challan-btn" className="btn btn-primary">
            + New Challan
          </Link>
        )}
      </div>

      <div className="card p-4 mb-4 flex gap-3">
        <select
          id="challan-status-filter"
          className="select w-48"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Challan #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Qty</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8}><LoadingSpinner /></td></tr>
            ) : result?.data.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">No challans found</td></tr>
            ) : result?.data.map(c => (
              <tr key={c.id}>
                <td>
                  <Link to={`/challans/${c.id}`} className="text-brand-400 hover:text-brand-300 font-mono font-medium">
                    {c.challan_number}
                  </Link>
                </td>
                <td>
                  <p className="text-sm font-medium">{c.customer?.customer_name}</p>
                  <p className="text-xs text-gray-500">{c.customer?.business_name}</p>
                </td>
                <td className="text-gray-400">{c.items?.length ?? 0} item{(c.items?.length ?? 0) !== 1 ? 's' : ''}</td>
                <td className="font-semibold">{c.total_quantity}</td>
                <td><StatusBadge status={c.status} /></td>
                <td className="text-gray-400 text-xs">{c.creator?.name}</td>
                <td className="text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                <td>
                  <Link to={`/challans/${c.id}`} className="btn btn-ghost btn-sm">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && <Pagination current={page} total={result.totalPages} onPageChange={setPage} />}
    </div>
  );
}
