import api from './api';
import { FacebookPage } from './facebookService';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'GESTOR_DE_LIVES' | 'EQUIPE_DE_PRODUCAO';
  authorizedPages?: FacebookPage[];
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password?: string;
  role: string;
  authorizedPageIds: string[];
}

export interface UserUpdateRequest {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
    authorizedPageIds?: string[];
}

export const getUsers = async () => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (user: UserCreateRequest) => {
  const response = await api.post<User>('/users', user);
  return response.data;
};

export const updateUser = async (id: number, user: UserUpdateRequest) => {
  const response = await api.put<User>(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`);
};