import api from './api';
import { Customer, CustomerFollowup, PaginatedResult } from '../types';

export const customerService = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResult<Customer>> => {
    const res = await api.get('/customers', { params });
    return res.data.data;
  },
  getById: async (id: string): Promise<Customer> => {
    const res = await api.get(`/customers/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post('/customers', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put(`/customers/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
  addFollowup: async (id: string, data: { note: string; follow_up_date?: string }): Promise<CustomerFollowup> => {
    const res = await api.post(`/customers/${id}/followups`, data);
    return res.data.data;
  },
};
