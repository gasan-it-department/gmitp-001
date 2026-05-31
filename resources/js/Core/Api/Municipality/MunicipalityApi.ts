import axios from 'axios';
import Municipality from '@/actions/App/External/Api/Controllers/Municipality';

export const MunicipalitiesApi = {
    async getMunicipalities() {
        const { url, method } = Municipality.MunicipalityController.indexActiveMunicipalities();
        const { data } = await axios({
            url,
            method,
        });
        return data;
    },
};
