import { Router } from 'express';
import {
  getChallans, getChallanById, createChallan, updateChallan, confirmChallan, cancelChallan,
} from '../controllers/challan.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createChallanSchema, updateChallanSchema } from '../validators/challan.validator';

const router = Router();

router.use(authenticate);

router.get('/', getChallans);
router.get('/:id', getChallanById);
router.post('/', authorize('ADMIN', 'SALES'), validate(createChallanSchema), createChallan);
router.put('/:id', authorize('ADMIN', 'SALES'), validate(updateChallanSchema), updateChallan);
router.post('/:id/confirm', authorize('ADMIN', 'SALES'), confirmChallan);
router.post('/:id/cancel', authorize('ADMIN', 'SALES'), cancelChallan);

export default router;
