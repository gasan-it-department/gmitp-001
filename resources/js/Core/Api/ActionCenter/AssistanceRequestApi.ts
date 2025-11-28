import axios from "axios";
import type { AssistanceRequestResponse, AssistanceStatus, AssistanceOption, AssistanceOptionsResponse } from "@/Core/Types/ActionCenter/AssistanceRequestTypes";
import ActionCenterController from "@/actions/App/External/Api/Controllers/ActionCenter/ActionCenterController";

export const ActionCenterApi = {

    async storeRequest(municipalSlug: string, formData: any) {
        const { url, method } = ActionCenterController.store();

        const { data } = await axios({
            url,
            data: formData,
            method,
            headers: {

                'X-Municipality-Slug': municipalSlug,

            }
        });

        return data;

    },

    async getAllRequest(municipalSlug: string) {
        const { url, method } = ActionCenterController.fetch();

        const { data } = await axios({
            url, method,
            headers: {

                'X-Municipality-Slug': municipalSlug

            }
        })

        return data;

    },

    async getStatusLabels() {
        const { url, method } = ActionCenterController.getStatusList();

        const { data } = await axios({
            url,
            method,
        });

        return data;
    },

    async getAssistanceTypes(municipalSlug: string) {
        const { url, method } = ActionCenterController.getAssistanceTypesList();

        const { data } = await axios({
            url,
            method,
            headers: {

                'X-Municipality-Slug': municipalSlug

            }
        });
        console.log(data, 'hello');
        return data;
    }


};
