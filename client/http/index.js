import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000/' : '/');
export const buildApiResourceUrl = (path) => `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export const $host = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

export const $authHost = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});
