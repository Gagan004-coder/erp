import api from './api';
import { Challan, PaginatedResult } from '../types';

export const challanService = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResult<Challan>> => {
    const res = await api.get('/challans', { params });
    return res.data.data;
  },
  getById: async (id: string): Promise<Challan> => {
    const res = await api.get(`/challans/${id}`);
    return res.data.data;
  },
  create: async (data: { customer_id: string; items: { product_id: string; quantity: number }[] }): Promise<Challan> => {
    const res = await api.post('/challans', data);
    return res.data.data;
  },
  update: async (id: string, data: { customer_id?: string; items?: { product_id: string; quantity: number }[] }): Promise<Challan> => {
    const res = await api.put(`/challans/${id}`, data);
    return res.data.data;
  },
  confirm: async (id: string): Promise<Challan> => {
    const res = await api.post(`/challans/${id}/confirm`);
    return res.data.data;
  },
  cancel: async (id: string): Promise<Challan> => {
    const res = await api.post(`/challans/${id}/cancel`);
    return res.data.data;
  },
};
