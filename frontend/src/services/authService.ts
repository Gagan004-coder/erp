import api from './api';
import { AuthData } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthData> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
