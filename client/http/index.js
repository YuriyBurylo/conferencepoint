import axios from 'axios';

export const $host = axios.create({
    baseURL: 'http://localhost:3000/'
});

export const $authHost = axios.create({
    baseURL: 'http://localhost:3000/'
});

// Interceptor to attach JWT token to authenticated requests
$authHost.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
