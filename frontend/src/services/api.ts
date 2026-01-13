import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect if it's a login/register request (user is already on login page)
            const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                error.config?.url?.includes('/auth/register');

            if (!isAuthEndpoint) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
