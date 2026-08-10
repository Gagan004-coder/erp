import { z } from 'zod';

export const createChallanSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  items: z.array(
    z.object({
      product_id: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })
  ).min(1, 'At least one item is required'),
});

export const updateChallanSchema = z.object({
  customer_id: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).optional(),
});
