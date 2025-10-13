import axios from "axios";
import type { AssistanceRequestResponse, AssistanceStatus, AssistanceOptions } from "@/Core/Types/ActionCenter/AssistanceRequestTypes";

const REQUESTS_URL = "/action-center/request"; //getting all the request
const STATUS_URL = "/action-center/admin/status-list"; //getting all statuses
const ASSISTANCE_URL = "/action-center/assistance-options";

export const ActionCenterApi = {
    async getAllRequest(): Promise<AssistanceRequestResponse> {
        const { data } = await axios.get<AssistanceRequestResponse>(REQUESTS_URL);
        return data;
    },

    async getAllStatus(): Promise<AssistanceStatus> {
        const { data } = await axios.get<AssistanceStatus>(STATUS_URL);
        return data;
    },

    async getAllAssitanceOptions(): Promise<AssistanceOptions> {
        const { data } = await axios.get<AssistanceOptions>(ASSISTANCE_URL);
        return data
    }
};
