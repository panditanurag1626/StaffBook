import axios from 'axios';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://admin.staffbook.in/api/web/v1';

// Smart resolution for API Base URL
export const API_BASE_URL = (() => {
    if (typeof window !== 'undefined') {
        // In browser: Use the proxy endpoint (/api/proxy/) to avoid CORS issues
        // which are strictly enforced on production domains like Vercel.
        return '/api/proxy/';
    }
    // Default or Server-side: Use the configured URL
    return rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
})();

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json'
    },
    timeout: 30000, // 30 seconds
    withCredentials: false // Ensure we don't trigger CORS issues with Allowed-Origin: *
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            // Ensure token is not null, undefined or the string equivalents
            if (token && token !== 'undefined' && token !== 'null') {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Detailed logging for Network Errors
        if (error.message === 'Network Error') {
            console.error(`API Network Error: [${error.config?.method?.toUpperCase()}] ${error.config?.baseURL}${error.config?.url}`);
            console.error('Please check if the API server is reachable and CORS is configured.');
        }

        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                // Avoid infinite redirect if already on signin
                if (!window.location.pathname.includes('/signin') && !window.location.pathname.includes('/signup')) {
                    window.location.href = '/signin';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
