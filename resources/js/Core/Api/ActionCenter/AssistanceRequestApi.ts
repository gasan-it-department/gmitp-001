import axios from "axios";
import type { AssistanceRequestResponse } from "@/Core/Types/ActionCenter/AssistanceRequestTypes"

const API_URL = "/action-center/request";//api get all request

export const ActionCenterApi = {
    async getAllRequest(): Promise<AssistanceRequestResponse> {
        const { data } = await axios.get<AssistanceRequestResponse>(API_URL);
        return data;
    }
}