import axios from 'axios';

import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';

interface GetMunicipalitiesResponse {
    success: boolean;
    data: Municipality[];
    message?: string;
}

export const getMunicipalities = async () => {
    const response = await axios.get<GetMunicipalitiesResponse>('/super-admin/municipalities-list');

    return response.data.data;
}