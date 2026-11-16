import axios from 'axios';
import { getToken } from './authStorage.js';

const api=axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout:10000,
});

let onUnauthorized=null;

export function setUnauthorizedHandler(handler){
    onUnauthorized=handler;
}

api.interceptors.request.use((config) => {
    const token=getToken();
    if(token) {
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url=error.config?.url ?? '';
        const isAuthForm=url.startsWith('/auth/login') || url.startsWith('/auth.register');

        if (error.response?.status === 401 && !isAuthForm && getToken()) {
            onUnauthorized?.();
        }

        return Promise.reject(error);
    }
);

export default api;