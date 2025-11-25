import axios from 'axios';

const apiAxios = axios.create({
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    }

});

export default axios
