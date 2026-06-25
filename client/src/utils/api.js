import { API_URL } from '../config';

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(`${API_URL}${url}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const authHeaders = () => {
  const token = localStorage.getItem('erp_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
