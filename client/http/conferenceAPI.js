import { $host, $authHost, buildApiResourceUrl } from './index';

export const fetchNextConference = async () => {
    const response = await $host.get('api/nextconference');
    return response;
};

export const fetchNewConferences = async () => {
    const response = await $host.get('api/newconferences');
    return response;
};

export const fetchNewConferenceById = async (id) => {
    const response = await $host.get(`api/newconferences/${id}`);
    return response;
};

export const fetchArchiveConferences = async () => {
    const response = await $host.get('api/pastconferences');
    return response;
};

export const fetchAdminArchiveConferences = async () => {
    const response = await $authHost.get('api/pastconferences/admin/all');
    return response;
};

export const fetchArchiveConferenceById = async (id) => {
    const response = await $host.get(`api/pastconferences/${id}`);
    return response;
};

export const fetchArchiveConferenceMaterials = async (id) => {
    const response = await $host.get(`api/pastconferences/${id}/materials`, {responseType: 'blob'});
    const blobResult = response.data;

    const url = window.URL.createObjectURL(blobResult);

    const link = document.createElement('a');
    link.href = url;

    link.setAttribute('download', `conference${id}.pdf`);

    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
    }, 1000);
};

export const getArchiveConferenceMaterialsUrl = (id) => (
    buildApiResourceUrl(`api/pastconferences/${id}/materials`)
);

export const fetchNewConferenceMaterials = async (id) => {
    const response = await $host.get(`api/newconferences/${id}/materials`, {responseType: 'blob'});
    const blobResult = response.data;

    const url = window.URL.createObjectURL(blobResult);

    const link = document.createElement('a');
    link.href = url;

    link.setAttribute('download', `conference${id}.pdf`);

    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
    }, 1000);
};

export const getNewConferenceMaterialsUrl = (id) => (
    buildApiResourceUrl(`api/newconferences/${id}/materials`)
);

export const moveConferenceToArchive = async (id) => {
    const response = await $authHost.post(`api/newconferences/${id}/archive`);
    return response.data;
};

export const updateArchiveConference = async (formData) => {
    const response = await $authHost.put('api/pastconferences', formData);
    return response.data;
};

export const updateNewConference = async (formData) => {
    const response = await $authHost.put('api/newconferences', formData);
    return response.data;
};
