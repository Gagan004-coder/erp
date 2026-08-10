import api from './api';
import { StockMovement, PaginatedResult, DashboardStats } from '../types';

export const inventoryService = {
  getMovements: async (params?: Record<string, string>): Promise<PaginatedResult<StockMovement>> => {
    const res = await api.get('/inventory/movements', { params });
    return res.data.data;
  },
  createMovement: async (data: { product_id: string; quantity: number; type: string; reason: string }): Promise<StockMovement> => {
    const res = await api.post('/inventory/movements', data);
    return res.data.data;
  },
  getLowStock: async () => {
    const res = await api.get('/inventory/low-stock');
    return res.data.data;
  },
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/inventory/stats');
    return res.data.data;
  },
};
