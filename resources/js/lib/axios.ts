import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    }

});

api.interceptors.response.use(
    (response) => {

        return response;

    },

    (error) => {
        const message = error.response?.data?.message || 'Something went wrong.';


    }

);

export default api;
