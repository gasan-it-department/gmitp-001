import axios from "axios";
import type { AssistanceRequestResponse, AssistanceStatus, AssistanceOption, AssistanceOptionsResponse } from "@/Core/Types/ActionCenter/AssistanceRequestTypes";
import ActionCenterController from "@/actions/App/External/Api/Controllers/ActionCenter/ActionCenterController";

export const ActionCenterApi = {
    async getAllRequest(municipalSlug: string) {
        const { url, method } = ActionCenterController.fetch();
        console.log(url, method);
        const { data } = await axios({
            url, method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            }
        })

        return data;
    },

    async storeRequest(municipalSlug: string) {
        const { url, method } = ActionCenterController.store();


    },
};
