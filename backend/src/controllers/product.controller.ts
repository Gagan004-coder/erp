import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { Prisma } from '@prisma/client';

export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, search, category } = req.query as Record<string, string>;
    const { page: p, limit: l, skip } = getPagination(page, limit);

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { product_name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = { equals: category, mode: 'insensitive' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: l, orderBy: { created_at: 'desc' } }),
      prisma.product.count({ where }),
    ]);

    res.json({ success: true, data: buildPaginatedResponse(products, total, p, l) });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        stock_movements: {
          orderBy: { created_at: 'desc' },
          take: 20,
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!product) throw new AppError('Product not found', 404);

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.product.findUnique({ where: { sku: req.body.sku } });
    if (existing) throw new AppError('SKU already exists', 409);

    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Product not found', 404);

    if (req.body.sku && req.body.sku !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({ where: { sku: req.body.sku } });
      if (skuTaken) throw new AppError('SKU already in use', 409);
    }

    const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Product not found', 404);

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    res.json({ success: true, data: categories.map(c => c.category) });
  } catch (err) {
    next(err);
  }
};
