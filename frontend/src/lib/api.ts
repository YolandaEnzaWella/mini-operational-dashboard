import axios from 'axios';
import { ValidationErrors } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Tidak dapat terhubung ke server';
    }

    return error.response.data?.message || 'Terjadi kesalahan';
  }

  return 'Terjadi kesalahan';
}

export function getValidationErrors(error: unknown): ValidationErrors {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    return error.response.data?.errors || {};
  }

  return {};
}

export default api;
