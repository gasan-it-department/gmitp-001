import PublicInformation from "@/actions/App/External/Api/Controllers/PublicInformation";
import axios from "axios"


export const ProcurementsApi = {

    async store(municiplaySlug: string, formData: any) {
        const { url, method } = await PublicInformation.ProcurementsController.store();

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