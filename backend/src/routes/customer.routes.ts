import { Router } from 'express';
import {
  getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, createFollowup,
} from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, createFollowupSchema } from '../validators/customer.validator';

const router = Router();

router.use(authenticate);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', authorize('ADMIN', 'SALES'), validate(createCustomerSchema), createCustomer);
router.put('/:id', authorize('ADMIN', 'SALES'), validate(updateCustomerSchema), updateCustomer);
router.delete('/:id', authorize('ADMIN'), deleteCustomer);
router.post('/:id/followups', authorize('ADMIN', 'SALES'), validate(createFollowupSchema), createFollowup);

export default router;
