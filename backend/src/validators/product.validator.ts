import { z } from 'zod';

export const createProductSchema = z.object({
  product_name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unit_price: z.number().positive('Unit price must be positive'),
  current_stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  minimum_stock: z.number().int().min(0).default(0),
  warehouse_location: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();
