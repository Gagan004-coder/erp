import api from './api';
import { Product, PaginatedResult } from '../types';

export const productService = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResult<Product>> => {
    const res = await api.get('/products', { params });
    return res.data.data;
  },
  getById: async (id: string): Promise<Product> => {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post('/products', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put(`/products/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
  getCategories: async (): Promise<string[]> => {
    const res = await api.get('/products/categories');
    return res.data.data;
  },
};
