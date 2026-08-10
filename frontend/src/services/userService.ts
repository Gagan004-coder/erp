import api from './api';
import { User, PaginatedResult } from '../types';

export const userService = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResult<User>> => {
    const res = await api.get('/users', { params });
    return res.data.data;
  },
  getById: async (id: string): Promise<User> => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },
  create: async (data: { name: string; email: string; password: string; role: string }): Promise<User> => {
    const res = await api.post('/users', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<{ name: string; email: string; password: string; role: string }>): Promise<User> => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
