import axios from 'axios';

// Get CSRF token from the meta tag injected by Laravel
const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

export default axios;
