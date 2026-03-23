import procurement from "@/routes/procurement";
import axios from "axios"


export const ProcurementsApi = {

    async store(municiplaySlug: string, formData: any) {
        const { url, method } = await procurement.store();

        const { data } = await axios({
            url,
            method,
            data: formData,
            headers: {

                'X-Municipality-Slug': municiplaySlug,

                'Content-Type': 'multipart/form-data', // Explicitly set content type

            }
        });

        return data;

    }

}