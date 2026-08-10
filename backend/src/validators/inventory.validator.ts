import { z } from 'zod';

export const createMovementSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  type: z.enum(['IN', 'OUT']),
  reason: z.string().min(1, 'Reason is required'),
});
