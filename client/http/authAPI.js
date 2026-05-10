import { $host, $authHost } from './index';

export const registerUser = async (data) => {
    const response = await $host.post('api/auth/register', data);
    return response.data;
};

export const loginUser = async (data) => {
    const response = await $host.post('api/auth/login', data);
    return response.data;
};

export const getProfile = async () => {
    const response = await $authHost.get('api/auth/profile');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await $authHost.put('api/auth/profile', data);
    return response.data;
};

export const getAllUsers = async () => {
    const response = await $authHost.get('api/auth/users');
    return response.data;
};

export const updateUserRole = async (id, role) => {
    const response = await $authHost.patch(`api/auth/users/${id}/role`, { role });
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await $authHost.delete(`api/auth/users/${id}`);
    return response.data;
};
