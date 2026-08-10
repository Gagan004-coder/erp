import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import LoadingSpinner from '../../components/LoadingSpinner';

const schema = z.object({
  product_name: z.string().min(2, 'Name required'),
  sku: z.string().min(1, 'SKU required'),
  category: z.string().min(1, 'Category required'),
  unit_price: z.coerce.number().positive('Must be positive'),
  current_stock: z.coerce.number().int().min(0),
  minimum_stock: z.coerce.number().int().min(0),
  warehouse_location: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { current_stock: 0, minimum_stock: 0 },
  });

  useEffect(() => {
    if (!isEdit) return;
    productService.getById(id!).then(p => {
      reset({ ...p, unit_price: Number(p.unit_price), warehouse_location: p.warehouse_location ?? '' });
    }).finally(() => setIsFetching(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isEdit) {
        await productService.update(id!, data);
        toast.success('Product updated');
      } else {
        await productService.create(data);
        toast.success('Product created');
      }
      navigate('/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <LoadingSpinner text="Loading product..." />;

  const Field = ({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update product details' : 'Add a new product to inventory'}</p>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6 space-y-4">
          <div className="form-grid">
            <Field label="Product Name *" id="product-name" error={errors.product_name?.message}>
              <input id="product-name" className={`input ${errors.product_name ? 'input-error' : ''}`} {...register('product_name')} />
            </Field>
            <Field label="SKU *" id="product-sku" error={errors.sku?.message}>
              <input id="product-sku" className={`input ${errors.sku ? 'input-error' : ''}`} {...register('sku')} />
            </Field>
            <Field label="Category *" id="product-category" error={errors.category?.message}>
              <input id="product-category" className={`input ${errors.category ? 'input-error' : ''}`} {...register('category')} placeholder="e.g. Electronics" />
            </Field>
            <Field label="Unit Price (₹) *" id="unit-price" error={errors.unit_price?.message}>
              <input id="unit-price" type="number" step="0.01" className={`input ${errors.unit_price ? 'input-error' : ''}`} {...register('unit_price')} />
            </Field>
            <Field label="Current Stock *" id="current-stock" error={errors.current_stock?.message}>
              <input id="current-stock" type="number" className="input" {...register('current_stock')} />
            </Field>
            <Field label="Minimum Stock *" id="minimum-stock" error={errors.minimum_stock?.message}>
              <input id="minimum-stock" type="number" className="input" {...register('minimum_stock')} />
            </Field>
            <Field label="Warehouse Location" id="warehouse-location" error={undefined}>
              <input id="warehouse-location" className="input" {...register('warehouse_location')} placeholder="e.g. Rack A-1" />
            </Field>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
          <button id="product-submit" type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
