import { $host } from './index';

export const fetchNewConferences = async () => {
    const response = await $host.get('api/newconferences');
    return response;
};

export const fetchNewConferenceById = async (id) => {
    const response = await $host.get(`api/conference/${id}`);
    return response;
};

export const fetchArchiveConferences = async () => {
    const response = await $host.get('api/pastconferences');
    console.log(response);
    return response;
};

export const fetchNextConference = async () => {
    const response = await $host.get('api/conference');
    console.log(response);
    return response;
};

export const fetchArchiveConferenceMaterials = async (id) => {
    const response = await $host.get(`api/pastconferences/${id}`, {responseType: 'blob'});
    const blobResult = response.data;
    console.log(blobResult);

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

export const fetchNewConferenceMaterials = async (id) => {
    const response = await $host.get(`api/newconferences/${id}`, {responseType: 'blob'});
    const blobResult = response.data;
    console.log(blobResult);

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
}

