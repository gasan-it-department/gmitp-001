import axios from 'axios';

import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';

interface GetMunicipalitiesResponse {
    success: boolean;
    data: MunicipalityType[];
    message?: string;
}

export const getMunicipalities = async () => {
    const response = await axios.get<GetMunicipalitiesResponse>('/municipality');

    return response.data.data;
}