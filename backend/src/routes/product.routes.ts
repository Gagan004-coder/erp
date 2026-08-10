import { Router } from 'express';
import {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

router.use(authenticate);

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authorize('ADMIN', 'WAREHOUSE'), validate(createProductSchema), createProduct);
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), validate(updateProductSchema), updateProduct);
router.delete('/:id', authorize('ADMIN'), deleteProduct);

export default router;
