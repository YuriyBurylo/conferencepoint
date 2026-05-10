import { $authHost } from './index';

export const submitArticle = async (formData) => {
    const response = await $authHost.post('api/articles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getMyArticles = async () => {
    const response = await $authHost.get('api/articles/my');
    return response.data;
};

export const getArticleById = async (id) => {
    const response = await $authHost.get(`api/articles/${id}`);
    return response.data;
};

export const downloadArticle = async (id, fileName) => {
    const response = await $authHost.get(`api/articles/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
    }, 1000);
};

export const updateArticle = async (id, formData) => {
    const response = await $authHost.put(`api/articles/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteArticle = async (id) => {
    const response = await $authHost.delete(`api/articles/${id}`);
    return response.data;
};

// Admin endpoints
export const getAllArticles = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.conference_id) params.append('conference_id', filters.conference_id);
    const response = await $authHost.get(`api/articles?${params.toString()}`);
    return response.data;
};

export const reviewArticle = async (id, data) => {
    const response = await $authHost.patch(`api/articles/${id}/review`, data);
    return response.data;
};
