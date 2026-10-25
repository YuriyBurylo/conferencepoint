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

// Browser-to-Blob uploads keep 20 MB documents out of Vercel function requests.
$authHost.interceptors.request.use(async (config) => {
    if (import.meta.env.VITE_BLOB_UPLOADS !== 'true' || !(config.data instanceof FormData)) return config;
    const { uploadPresigned } = await import('@vercel/blob/client');
    const { data: { prefix } } = await $authHost.get('api/uploads');
    const payload = { uploads: {} };
    for (const [field, value] of config.data.entries()) {
        if (!(value instanceof File)) {
            payload[field] = value;
            continue;
        }
        const extension = value.name.split('.').pop().toLowerCase();
        const pathname = `${prefix}${field}/${crypto.randomUUID()}.${extension}`;
        const blob = await uploadPresigned(pathname, value, {
            access: 'private',
            handleUploadUrl: buildApiResourceUrl('api/uploads'),
            contentType: value.type || 'application/octet-stream',
            multipart: true
        });
        payload.uploads[field] = { pathname: blob.pathname, name: value.name, mimetype: value.type };
    }
    config.data = payload;
    config.headers.set('Content-Type', 'application/json');
    return config;
});
