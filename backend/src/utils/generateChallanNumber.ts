import prisma from '../config/prisma';

export async function generateChallanNumber(): Promise<string> {
  const count = await prisma.challan.count();
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(4, '0');
  return `CH-${year}${sequence}`;
}
