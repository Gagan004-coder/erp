import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm<{ note: string; follow_up_date?: string }>();

  const load = () => {
    customerService.getById(id!).then(setCustomer).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const onFollowupSubmit = async (data: { note: string; follow_up_date?: string }) => {
    setIsSubmitting(true);
    try {
      await customerService.addFollowup(id!, {
        ...data,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date).toISOString() : undefined,
      });
      toast.success('Follow-up added');
      reset();
      setShowFollowupForm(false);
      load();
    } catch {
      toast.error('Failed to add follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading customer..." />;
  if (!customer) return <div className="text-gray-400">Customer not found</div>;

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/customers" className="hover:text-gray-300">Customers</Link>
            <span>/</span>
            <span className="text-gray-300">{customer.customer_name}</span>
          </div>
          <h1 className="page-title">{customer.customer_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={customer.status} />
            <StatusBadge status={customer.customer_type} />
          </div>
        </div>
        {canEdit && (
          <Link to={`/customers/${id}/edit`} className="btn btn-secondary">
            Edit Customer
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Contact Details</h2>
          <dl className="space-y-3">
            {[
              { label: 'Mobile', value: customer.mobile },
              { label: 'Email', value: customer.email ?? '—' },
              { label: 'Business', value: customer.business_name ?? '—' },
              { label: 'GST Number', value: customer.gst_number ?? '—' },
              { label: 'Address', value: customer.address ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <dt className="text-xs text-gray-500">{label}</dt>
                <dd className="text-sm text-gray-200 text-right max-w-[60%]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">CRM Info</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Follow-up Date</dt>
              <dd className="text-sm text-gray-200">
                {customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Created</dt>
              <dd className="text-sm text-gray-200">{new Date(customer.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
          {customer.notes && (
            <div className="mt-4 pt-4 border-t border-surface-600">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-300">{customer.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Follow-up History</h2>
          {canEdit && (
            <button id="add-followup-btn" className="btn btn-secondary btn-sm" onClick={() => setShowFollowupForm(v => !v)}>
              + Add Follow-up
            </button>
          )}
        </div>

        {showFollowupForm && (
          <form id="followup-form" onSubmit={handleSubmit(onFollowupSubmit)} className="mb-4 p-4 bg-surface-700 rounded-lg space-y-3">
            <div>
              <label className="label">Note *</label>
              <textarea className="input min-h-[70px]" {...register('note', { required: true })} placeholder="Follow-up note..." />
            </div>
            <div>
              <label className="label">Next Follow-up Date</label>
              <input type="date" className="input" {...register('follow_up_date')} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add Note'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowFollowupForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {customer.followups?.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No follow-ups yet</p>
        ) : (
          <div className="space-y-3">
            {customer.followups?.map(f => (
              <div key={f.id} className="flex gap-3 p-3 bg-surface-700 rounded-lg">
                <div className="w-1.5 rounded-full bg-brand-500 flex-shrink-0 my-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-200">{f.note}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                    <span>{new Date(f.created_at).toLocaleDateString()}</span>
                    {f.follow_up_date && <span>→ Next: {new Date(f.follow_up_date).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {customer.challans && customer.challans.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Recent Challans</h2>
          <div className="space-y-2">
            {customer.challans.map(c => (
              <Link key={c.id} to={`/challans/${c.id}`} className="flex items-center justify-between p-3 bg-surface-700 rounded-lg hover:bg-surface-600 transition-colors">
                <div>
                  <p className="text-sm font-medium text-brand-400">{c.challan_number}</p>
                  <p className="text-xs text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Qty: {c.total_quantity}</span>
                  {c.status && <StatusBadge status={c.status} />}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
