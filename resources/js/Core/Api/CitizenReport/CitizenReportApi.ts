import CitizenReport from "@/actions/App/External/Api/Controllers/CitizenReport"
import axios from "axios";


export const CitizenReportApi = {
    async storeCitizenReport(municipalSlug: string, formData: any) {
        const { url, method } = CitizenReport.CitizenReportController.store();

        const { data } = await axios({
            url,
            method,
            data: formData,
            headers: {

                'X-Municipality-Slug': municipalSlug

            },
        });

        return data;

    },

    async getCitizenReport(municipalSlug: string) {
        const { url, method, } = CitizenReport.CitizenReportController.show();

        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;

    }


}