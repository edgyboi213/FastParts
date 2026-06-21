import axios from 'axios';
import { Category, Part, User, CartItem, Order } from '../types';

const API_BASE_URL = 'http://94.232.43.184:5001/api'; // Standard local ASP.NET URL, user can change in .env if needed

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/Categories').then(res => res.data),
  getById: (id: number) => api.get<Category>(`/Categories/${id}`).then(res => res.data),
  create: (data: Partial<Category>) => api.post<Category>('/Categories', data).then(res => res.data),
  update: (id: number, data: Partial<Category>) => api.put(`/Categories/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Categories/${id}`).then(res => res.data),
};

export const partsApi = {
  getAll: () => api.get<Part[]>('/Parts').then(res => res.data),
  getById: (id: number) => api.get<Part>(`/Parts/${id}`).then(res => res.data),
  getByCategory: (categoryId: number) => api.get<Part[]>(`/Parts?categoryId=${categoryId}`).then(res => res.data),
  create: (data: Partial<Part>) => api.post<Part>('/Parts', data).then(res => res.data),
  update: (id: number, data: Partial<Part>) => api.put(`/Parts/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Parts/${id}`).then(res => res.data),
};

export const authApi = {
  login: (data: any) => api.post('/Auth/login', data).then(res => res.data),
  register: (data: any) => api.post('/Auth/register', data).then(res => res.data),
  adminLogin: (data: any) => api.post('/AdminAuth/login', data).then(res => res.data),
};

export const cartApi = {
  getUserCart: (userId: number) => api.get<CartItem[]>(`/Carts?userId=${userId}`).then(res => res.data),
  addItem: (data: any) => api.post<CartItem>('/Carts', data).then(res => res.data),
  updateItem: (id: number, data: any) => api.put(`/Carts/${id}`, data).then(res => res.data),
  deleteItem: (id: number) => api.delete(`/Carts/${id}`).then(res => res.data),
};

export const ordersApi = {
  getAll: () => api.get<Order[]>('/Orders').then(res => res.data),
  create: (data: any) => api.post<Order>('/Orders', data).then(res => res.data),
  getUserOrders: (userId: number) => api.get<Order[]>(`/Orders?userId=${userId}`).then(res => res.data),
  update: (id: number, data: any) => api.put(`/Orders/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Orders/${id}`).then(res => res.data),
};

export const adminsApi = {
  getAll: () => api.get<any[]>('/Admins').then(res => res.data),
  create: (data: any) => api.post('/Admins', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/Admins/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Admins/${id}`).then(res => res.data),
};

export const mediaApi = {
  getAll: () => api.get<any[]>('/Media').then(res => res.data),
  create: (data: any) => api.post('/Media', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/Media/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Media/${id}`).then(res => res.data),
};

export const oemApi = {
  getAll: () => api.get<any[]>('/Oemnumbers').then(res => res.data),
  create: (data: any) => api.post('/Oemnumbers', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/Oemnumbers/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Oemnumbers/${id}`).then(res => res.data),
};

export const profilePhotosApi = {
  getAll: () => api.get<any[]>('/Profilephotoes').then(res => res.data),
  create: (data: any) => api.post('/Profilephotoes', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/Profilephotoes/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Profilephotoes/${id}`).then(res => res.data),
};

export const reviewsApi = {
  getAll: () => api.get<any[]>('/Reviews').then(res => res.data),
  create: (data: any) => api.post('/Reviews', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/Reviews/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Reviews/${id}`).then(res => res.data),
};

export const usersApi = {
  getAll: () => api.get<any[]>('/Users').then(res => res.data),
  getById: (id: number) => api.get<any>(`/Users/${id}`).then(res => res.data),
  create: (data: any) => api.post('/Users', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/Users/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/Users/${id}`).then(res => res.data),
};

export const orderpartsApi = {
  getAll: () => api.get<any[]>('/Orderparts').then(res => res.data),
  create: (data: any) => api.post('/Orderparts', data).then(res => res.data),
  update: (id: any, data: any) => api.put(`/Orderparts/${id}`, data).then(res => res.data),
  delete: (id: any) => api.delete(`/Orderparts/${id}`).then(res => res.data),
};
