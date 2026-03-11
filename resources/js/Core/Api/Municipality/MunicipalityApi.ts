import axios from 'axios';
// Adjust imports based on your actual path
import Municipality from '@/actions/App/External/Api/Controllers/Municipality';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import SetMunicipalityLogoController from '@/actions/App/External/Api/Controllers/Municipality/Logo/SetMunicipalityLogoController';
import UpdateMunicipalityLogoController from '@/actions/App/External/Api/Controllers/Municipality/Logo/UpdateMunicipalityLogoController';

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
    async uploadMunicipalLogo(municipalSlug: string, formData: FormData) {
        const { url, method } = SetMunicipalityLogoController();

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

    async updateMunicipalityLogo(municipalSlug: string, payload: { logo?: File | null }) {
        // 1. Get route from Wayfinder
        // Assuming the name in Wayfinder follows your route name: 'municipality.admin.update.logo'
        const { url } = UpdateMunicipalityLogoController();

        const formData = new FormData();

        if (payload.logo) {
            // MATCH: Use 'logo' because that's what your Controller validates: $request->file('logo')
            formData.append('logo', payload.logo);
        }

        // This allows Laravel to treat this POST as a PUT/PATCH while still reading the file
        formData.append('_method', 'POST');

        const { data } = await axios.post(url, formData, {
            headers: {
                'X-Municipality-Slug': municipalSlug,
                // Axios automatically sets 'multipart/form-data' with the correct boundary when it sees FormData
            }
        });

        return data;
    }

}