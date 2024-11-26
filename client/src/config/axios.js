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
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
    }
});

// Add request interceptor
api.interceptors.request.use(request => {
    request.withCredentials = true;
    console.log('Starting Request:', request.url);
    return request;
});

// Add response interceptor for debugging
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