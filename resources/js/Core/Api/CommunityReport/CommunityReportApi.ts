import CommunityReport from "@/actions/App/External/Api/Controllers/CommunityReport";
import axios from "axios";

export const CommunityReportApi = {
    async storeCommunityReport(municipalSlug: string, payload: any) {

        const { url, method } = CommunityReport.CommunityReportController.store();

        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {

            if (key !== "files" && value) {

                formData.append(key, value as any);

            }

        });

        if (payload.files && payload.files.length > 0) {
            payload.files.forEach((file: File) => {
                formData.append("files[]", file);
            });
        }

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

    async getCommunityReport(municipalSlug: string) {
        const { url, method, } = CommunityReport.CommunityReportController.fetch();
        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;

    },

    async resolveReport(id: string, municipalSlug: string, remarks: string) {
        const { url, method } = CommunityReport.CommunityReportController.resolve(id);

        const { data } = await axios({
            url,
            method,
            data: { remarks: remarks },
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });

        return data;

    },

    async getReportType(municipalSlug: string) {
        const { url, method } = CommunityReport.CommunityReportTypeController.getCommunityReportType();

        const { data } = await axios({

            url, method, headers: { 'X-Municipality-Slug': municipalSlug }

        });

        return data;
    },

    async reject({ id, municipalSlug, remarks }: { id: string, municipalSlug: string, remarks: string }) {
        const { url, method } = CommunityReport.CommunityReportController.reject(id);

        const { data } = await axios({
            url,
            method,
            data: { remarks: remarks },
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        });
        return data;
    }


}