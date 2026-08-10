import { z } from 'zod';

export const createCustomerSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits').max(15),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  business_name: z.string().optional(),
  gst_number: z.string().optional(),
  customer_type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  follow_up_date: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowupSchema = z.object({
  note: z.string().min(1, 'Note is required'),
  follow_up_date: z.string().datetime().optional().nullable(),
});
