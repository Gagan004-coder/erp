import { Router } from 'express';
import { getMovements, createMovement, getLowStock, getDashboardStats } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createMovementSchema } from '../validators/inventory.validator';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/low-stock', getLowStock);
router.get('/movements', getMovements);
router.post('/movements', authorize('ADMIN', 'WAREHOUSE'), validate(createMovementSchema), createMovement);

export default router;
