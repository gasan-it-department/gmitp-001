import Government from "@/actions/App/External/Api/Controllers/Government"
import { government } from "@/routes";
import axios from "axios";

export const GovernmentApi = {

    async SearhOfficial(query: string) {

        const { url, method } = Government.Official.SearchOfficialsController();

        const response = await axios({
            url,
            method,
            params: { query }
        })

        return response.data.data;

    },

    async StoreOfficial(formData: any, municipalSlug: string) {

        const { url, method } = Government.Official.StoreOfficialController();

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