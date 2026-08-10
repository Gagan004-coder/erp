import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateChallanNumber } from '../utils/generateChallanNumber';

interface ChallanItemInput {
  product_id: string;
  quantity: number;
}

export async function createChallanService(customerId: string, items: ChallanItemInput[], createdBy: string) {
  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.product_id) } },
  });

  if (products.length !== items.length) {
    throw new AppError('One or more products not found', 404);
  }

  const challanNumber = await generateChallanNumber();
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  const challanItems = items.map(item => {
    const product = products.find(p => p.id === item.product_id)!;
    return {
      product_id: item.product_id,
      product_name: product.product_name,
      sku: product.sku,
      unit_price: product.unit_price,
      quantity: item.quantity,
    };
  });

  const challan = await prisma.challan.create({
    data: {
      challan_number: challanNumber,
      customer_id: customerId,
      total_quantity: totalQuantity,
      created_by: createdBy,
      status: 'DRAFT',
      items: { create: challanItems },
    },
    include: {
      items: true,
      customer: { select: { customer_name: true, business_name: true } },
      creator: { select: { name: true } },
    },
  });

  return challan;
}

export async function confirmChallanService(challanId: string, userId: string) {
  const challan = await prisma.challan.findUnique({
    where: { id: challanId },
    include: { items: true },
  });

  if (!challan) throw new AppError('Challan not found', 404);
  if (challan.status !== 'DRAFT') {
    throw new AppError(`Challan is already ${challan.status.toLowerCase()}`, 400);
  }

  const productIds = challan.items.map(i => i.product_id);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  for (const item of challan.items) {
    const product = products.find(p => p.id === item.product_id);
    if (!product) throw new AppError(`Product not found: ${item.product_name}`, 404);
    if (product.current_stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.product_name}". Available: ${product.current_stock}, Requested: ${item.quantity}`,
        400
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const item of challan.items) {
      const product = products.find(p => p.id === item.product_id)!;

      await tx.product.update({
        where: { id: item.product_id },
        data: { current_stock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          product_id: item.product_id,
          quantity: item.quantity,
          type: 'OUT',
          reason: `Challan ${challan.challan_number}`,
          created_by: userId,
        },
      });
    }

    await tx.challan.update({
      where: { id: challanId },
      data: { status: 'CONFIRMED' },
    });
  });

  return prisma.challan.findUnique({
    where: { id: challanId },
    include: {
      items: true,
      customer: { select: { customer_name: true, business_name: true } },
      creator: { select: { name: true } },
    },
  });
}

export async function cancelChallanService(challanId: string) {
  const challan = await prisma.challan.findUnique({ where: { id: challanId } });

  if (!challan) throw new AppError('Challan not found', 404);
  if (challan.status === 'CONFIRMED') {
    throw new AppError('Cannot cancel a confirmed challan', 400);
  }
  if (challan.status === 'CANCELLED') {
    throw new AppError('Challan is already cancelled', 400);
  }

  return prisma.challan.update({
    where: { id: challanId },
    data: { status: 'CANCELLED' },
    include: {
      items: true,
      customer: { select: { customer_name: true, business_name: true } },
    },
  });
}
