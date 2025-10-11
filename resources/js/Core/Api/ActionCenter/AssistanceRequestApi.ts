import axios from "axios";
import type { AssistanceRequestResponse, AssistanceStatus } from "@/Core/Types/ActionCenter/AssistanceRequestTypes";

const REQUESTS_URL = "/action-center/request";
const STATUS_URL = "/action-center/admin/status-list";

export const ActionCenterApi = {
    async getAllRequest(): Promise<AssistanceRequestResponse> {
        const { data } = await axios.get<AssistanceRequestResponse>(REQUESTS_URL);
        return data;
    },

    async getAllStatus(): Promise<AssistanceStatus> {
        const { data } = await axios.get<AssistanceStatus>(STATUS_URL);
        return data;
    },
};
