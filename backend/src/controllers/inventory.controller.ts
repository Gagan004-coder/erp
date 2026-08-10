import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

export const getMovements = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, product_id, type } = req.query as Record<string, string>;
    const { page: p, limit: l, skip } = getPagination(page, limit);

    const where: Record<string, unknown> = {};
    if (product_id) where.product_id = product_id;
    if (type) where.type = type;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: l,
        orderBy: { created_at: 'desc' },
        include: {
          product: { select: { product_name: true, sku: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    res.json({ success: true, data: buildPaginatedResponse(movements, total, p, l) });
  } catch (err) {
    next(err);
  }
};

export const createMovement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { product_id, quantity, type, reason } = req.body;

    const product = await prisma.product.findUnique({ where: { id: product_id } });
    if (!product) throw new AppError('Product not found', 404);

    if (type === 'OUT' && product.current_stock < quantity) {
      throw new AppError(`Insufficient stock. Available: ${product.current_stock}`, 400);
    }

    const newStock = type === 'IN'
      ? product.current_stock + quantity
      : product.current_stock - quantity;

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: { product_id, quantity, type, reason, created_by: req.user!.userId },
      }),
      prisma.product.update({
        where: { id: product_id },
        data: { current_stock: newStock },
      }),
    ]);

    res.status(201).json({ success: true, data: movement });
  } catch (err) {
    next(err);
  }
};

export const getLowStock = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lowStock = await prisma.$queryRaw<{ id: string; product_name: string; sku: string; current_stock: number; minimum_stock: number; category: string; warehouse_location: string | null }[]>`
      SELECT id, product_name, sku, current_stock, minimum_stock, category, warehouse_location
      FROM products
      WHERE current_stock <= minimum_stock
      ORDER BY current_stock ASC
    `;

    res.json({ success: true, data: lowStock });
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalCustomers, totalProducts, lowStockCount, draftChallans, confirmedChallans] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM products WHERE current_stock <= minimum_stock`,
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        lowStockCount: Number((lowStockCount as { count: bigint }[])[0]?.count ?? 0),
        draftChallans,
        confirmedChallans,
      },
    });
  } catch (err) {
    next(err);
  }
};
