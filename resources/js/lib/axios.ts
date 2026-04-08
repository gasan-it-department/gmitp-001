import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    withCredentials: true,          // ✅ Perfect for Laravel internal auth
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,

    (error) => {
        // 1. 🛡️ DEAD SERVER / NETWORK CRASH CHECK
        // If there is no response, the request never reached Laravel.
        if (!error.response) {
            toast.error('Network Error', {
                description: 'Cannot connect to the server. Please check your internet connection.'
            });
            return Promise.reject(error);
        }

        const status = error.response.status;
        const data = error.response.data;

        // Default to the top-level message (Good for DomainExceptions)
        let message = data?.message || 'Something went wrong.';

        // 2. 🛡️ LARAVEL FORM REQUEST CHECK
        // If it's a 422, Laravel might be sending a "Message Bag" of validation errors.
        if (status === 422) {
            if (data?.errors && typeof data.errors === 'object') {
                // Extract the very first error message from the bag
                const firstErrorKey = Object.keys(data.errors)[0];
                message = data.errors[firstErrorKey][0];
            }
            toast.error('Invalid Input', { description: message });
        }

        // 3. STANDARD STATUS HANDLING
        else if (status === 403) {
            toast.error('Unauthorized', { description: message });
        }
        else if (status === 409) {
            toast.error('Conflict', { description: message });
        }
        else if (status >= 500) {
            // Never show the user a raw SQL or PHP stack trace in production!
            toast.error('System Error', { description: 'The server encountered an issue. Please try again.' });
            console.error('Backend Error:', data); // Log the real error for developers
        }
        else {
            toast.error('Error', { description: message });
        }

        return Promise.reject(error);
    }
);

export default api;