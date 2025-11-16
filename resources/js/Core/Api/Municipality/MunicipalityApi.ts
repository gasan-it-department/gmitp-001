import axios from 'axios';

import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import Municipality from '@/actions/App/External/Api/Controllers/Municipality';
interface GetMunicipalitiesResponse {
    success: boolean;
    data: MunicipalityType[];
    message?: string;
}

export const MunicipalitiesApi = {
    async getMunicipalities() {
        const { url, method } = Municipality.MunicipalityController.indexActiveMunicipalities();

        const { data } = await axios({
            url,
            method,
        });

        return data;
    }
}
