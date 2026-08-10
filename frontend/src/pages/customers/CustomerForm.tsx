import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { customerService } from '../../services/customerService';
import LoadingSpinner from '../../components/LoadingSpinner';

const schema = z.object({
  customer_name: z.string().min(2, 'Name required'),
  mobile: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal('')),
  business_name: z.string().optional(),
  gst_number: z.string().optional(),
  customer_type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'LEAD', customer_type: 'RETAIL' },
  });

  useEffect(() => {
    if (!isEdit) return;
    customerService.getById(id!).then(c => {
      reset({
        ...c,
        follow_up_date: c.follow_up_date ? c.follow_up_date.slice(0, 10) : '',
        email: c.email ?? '',
        business_name: c.business_name ?? '',
        gst_number: c.gst_number ?? '',
        address: c.address ?? '',
        notes: c.notes ?? '',
      });
    }).finally(() => setIsFetching(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date).toISOString() : undefined,
      };
      if (isEdit) {
        await customerService.update(id!, payload);
        toast.success('Customer updated');
      } else {
        await customerService.create(payload);
        toast.success('Customer created');
      }
      navigate('/customers');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <LoadingSpinner text="Loading customer..." />;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Customer' : 'New Customer'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update customer information' : 'Add a new CRM contact'}</p>
        </div>
      </div>

      <form id="customer-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide border-b border-surface-600 pb-3">Contact Information</h2>
          <div className="form-grid">
            <div>
              <label className="label">Customer Name *</label>
              <input id="customer-name" className={`input ${errors.customer_name ? 'input-error' : ''}`} {...register('customer_name')} />
              {errors.customer_name && <p className="text-xs text-red-400 mt-1">{errors.customer_name.message}</p>}
            </div>
            <div>
              <label className="label">Mobile *</label>
              <input id="customer-mobile" className={`input ${errors.mobile ? 'input-error' : ''}`} {...register('mobile')} />
              {errors.mobile && <p className="text-xs text-red-400 mt-1">{errors.mobile.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input id="customer-email" type="email" className="input" {...register('email')} />
            </div>
            <div>
              <label className="label">Business Name</label>
              <input id="business-name" className="input" {...register('business_name')} />
            </div>
            <div>
              <label className="label">GST Number</label>
              <input id="gst-number" className="input" {...register('gst_number')} />
            </div>
            <div>
              <label className="label">Address</label>
              <input id="customer-address" className="input" {...register('address')} />
            </div>
          </div>

          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide border-b border-surface-600 pb-3 pt-2">Classification</h2>
          <div className="form-grid">
            <div>
              <label className="label">Customer Type *</label>
              <select id="customer-type" className="select" {...register('customer_type')}>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div>
              <label className="label">Status *</label>
              <select id="customer-status" className="select" {...register('status')}>
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="label">Follow Up Date</label>
              <input id="follow-up-date" type="date" className="input" {...register('follow_up_date')} />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea id="customer-notes" className="input min-h-[80px] resize-y" {...register('notes')} />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/customers')}>
            Cancel
          </button>
          <button id="customer-submit" type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
