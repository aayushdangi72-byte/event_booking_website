import axios from 'axios';

const api = axios.create({
    baseURL: 'https://event-booking-website-5qe6.onrender.com/api',                            //localhost
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');                     //localstorage.getitem
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;            //bearer token
    }
    return config;
});

export default api;



