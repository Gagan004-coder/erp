import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { createChallanService, confirmChallanService, cancelChallanService } from '../services/challan.service';

export const getChallans = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, status, customer_id } = req.query as Record<string, string>;
    const { page: p, limit: l, skip } = getPagination(page, limit);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: l,
        orderBy: { created_at: 'desc' },
        include: {
          customer: { select: { customer_name: true, business_name: true } },
          creator: { select: { name: true } },
          items: { select: { id: true, product_name: true, quantity: true, unit_price: true } },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    res.json({ success: true, data: buildPaginatedResponse(challans, total, p, l) });
  } catch (err) {
    next(err);
  }
};

export const getChallanById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        creator: { select: { name: true, role: true } },
        items: {
          include: { product: { select: { current_stock: true, warehouse_location: true } } },
        },
      },
    });

    if (!challan) throw new AppError('Challan not found', 404);

    res.json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

export const createChallan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customer_id, items } = req.body;
    const challan = await createChallanService(customer_id, items, req.user!.userId);
    res.status(201).json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

export const updateChallan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.challan.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Challan not found', 404);
    if (existing.status !== 'DRAFT') throw new AppError('Only DRAFT challans can be edited', 400);

    const { customer_id, items } = req.body;
    const data: Record<string, unknown> = {};

    if (customer_id) data.customer_id = customer_id;

    if (items) {
      const products = await prisma.product.findMany({ where: { id: { in: items.map((i: { product_id: string }) => i.product_id) } } });
      const challanItems = items.map((item: { product_id: string; quantity: number }) => {
        const product = products.find(p => p.id === item.product_id);
        if (!product) throw new AppError(`Product not found`, 404);
        return { product_id: item.product_id, product_name: product.product_name, sku: product.sku, unit_price: product.unit_price, quantity: item.quantity };
      });

      data.total_quantity = items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0);

      await prisma.challanItem.deleteMany({ where: { challan_id: req.params.id } });
      data.items = { create: challanItems };
    }

    const challan = await prisma.challan.update({
      where: { id: req.params.id },
      data,
      include: { items: true, customer: { select: { customer_name: true } } },
    });

    res.json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await confirmChallanService(req.params.id, req.user!.userId);
    res.json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

export const cancelChallan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await cancelChallanService(req.params.id);
    res.json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};
