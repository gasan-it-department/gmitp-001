import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    // baseURL: '/api',
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

        // 1. Handle Validation Errors (422) specifically if you want
        if (error.response?.status === 422) {
            toast.error('Validation Failed', {
                description: ''
            })
        }

        else if (error.response?.status >= 500) {

            toast.error('Server Error', {
                description: ''
            })
        }

        else {
            toast.error('Error', { description: message })
        }

        return Promise.reject(error);
    }

);

export default api;
