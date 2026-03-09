import Government from "@/actions/App/External/Api/Controllers/Government"
import StoreOfficialController from "@/actions/App/External/Api/Controllers/Government/Official/StoreOfficialController";
import axios from "axios";

export const GovernmentApi = {

    async SearhOfficial(query: string, municipalSlug: string) {

        const { url, method } = Government.Official.SearchOfficialsController();
        console.log(url);
        const response = await axios({
            url,
            method,
            params: { query },
            headers: {
                'X-Municipality-Slug': municipalSlug
            },
        })

        return response.data.data;

    },

    async StoreOfficial(formData: any, municipalSlug: string) {

        const { url, method } = StoreOfficialController();
        const { data } = await axios({
            url,
            method,
            data: formData,

            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Municipality-Slug': municipalSlug,

            }
        });

        return data;
    }
}