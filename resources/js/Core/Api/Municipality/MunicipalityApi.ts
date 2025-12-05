import axios from 'axios';
// Adjust imports based on your actual path
import Municipality from '@/actions/App/External/Api/Controllers/Municipality';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';

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
    },

    // UPDATED: Now accepts FormData
    async uploadMunicipalSettings(municipalSlug: string, formData: FormData) {
        const { url, method } = Municipality.MunicipalitySettingsController.store();

        const { data } = await axios({
            url,
            method,
            data: formData, // Pass the FormData here
            headers: {
                'X-Municipality-Slug': municipalSlug,
                'Content-Type': 'multipart/form-data', // Explicitly set content type
            }
        });

        return data;
    },

    async savebanner(municipalSlug: string, formData: FormData) {
        const { url, method } = Municipality.MunicipalitySettingsController.storeBanner();


        const { data } = await axios({
            url,
            method,
            data: formData, // Pass the FormData here
            headers: {
                'X-Municipality-Slug': municipalSlug,
                'Content-Type': 'multipart/form-data', // Explicitly set content type
            }
        });

        return data;
    }
}