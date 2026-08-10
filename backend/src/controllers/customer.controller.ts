import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, search, status, customer_type } = req.query as Record<string, string>;
    const { page: p, limit: l, skip } = getPagination(page, limit);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { customer_name: { contains: search, mode: 'insensitive' } },
        { business_name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status as 'LEAD' | 'ACTIVE' | 'INACTIVE';
    if (customer_type) where.customer_type = customer_type as 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: l, orderBy: { created_at: 'desc' } }),
      prisma.customer.count({ where }),
    ]);

    res.json({ success: true, data: buildPaginatedResponse(customers, total, p, l) });
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        followups: { orderBy: { created_at: 'desc' } },
        challans: { orderBy: { created_at: 'desc' }, take: 10, select: { id: true, challan_number: true, status: true, total_quantity: true, created_at: true } },
      },
    });

    if (!customer) throw new AppError('Customer not found', 404);

    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await prisma.customer.create({ data: req.body });
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Customer not found', 404);

    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Customer not found', 404);

    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};

export const createFollowup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer) throw new AppError('Customer not found', 404);

    const followup = await prisma.customerFollowup.create({
      data: { customer_id: req.params.id, note: req.body.note, follow_up_date: req.body.follow_up_date },
    });

    if (req.body.follow_up_date) {
      await prisma.customer.update({
        where: { id: req.params.id },
        data: { follow_up_date: req.body.follow_up_date },
      });
    }

    res.status(201).json({ success: true, data: followup });
  } catch (err) {
    next(err);
  }
};
