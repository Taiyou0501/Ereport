import axios from 'axios';

const baseURL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:8081'
    : 'https://ereport-4.onrender.com';

console.log('Mode:', import.meta.env.MODE);
console.log('Base URL:', baseURL);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Modify request interceptor
api.interceptors.request.use(
    config => {
        config.withCredentials = true;
        // Don't set this header manually, let the browser handle it
        delete config.headers['Access-Control-Allow-Credentials'];
        console.log('Starting Request:', config.url);
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error);
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api; 