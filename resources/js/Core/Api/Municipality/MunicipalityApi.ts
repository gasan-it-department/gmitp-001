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
            data: formData,
            headers: {
                'X-Municipality-Slug': municipalSlug,
                'Content-Type': 'multipart/form-data',
            }
        });

        return data;
    },

    async savebanner(municipalSlug: string, formData: FormData) {
        const { url, method } = Municipality.MunicipalitySettingsController.storeBanner();

        console.log(municipalSlug);
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

    async deleteBanner(municipalSlug: string, id: string) {
        const { url, method } = Municipality.MunicipalitySettingsController.destroyBanner(id);

        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;

    },

    async updateMunicipalitySettings(
        municipalSlug: string,
        id: string,
        payload: { logo?: File | null }
    ) {
        const { url, method } = Municipality.MunicipalitySettingsController.updateSettings(id);

        // 2. Create FormData object
        const formData = new FormData();

        // Only append the file if the user selected a NEW one
        // This satisfies your "if uploaded update it, if none (ignore)" requirement
        if (payload.logo) {
            formData.append('logo', payload.logo);
            // Make sure 'logoImage' matches the key expected in your Backend DTO ($dto->logoImage)
        }

        // 3. Send the request
        // Note: We use '_method' trick if your backend requires PUT/PATCH via FormData (common in Laravel)
        // If your backend natively supports PUT for multipart, you can skip appending '_method'.
        formData.append('_method', 'PATCH');

        const { data } = await axios({
            url,
            method: 'POST', // Use POST with _method: PUT for file uploads (safest cross-server compatible way)
            data: formData, // Pass the FormData here
            headers: {
                'X-Municipality-Slug': municipalSlug,
                // 'Content-Type': 'multipart/form-data' <--- REMOVED! Let Axios handle this automatically.
            }
        });

        return data;
    },

}