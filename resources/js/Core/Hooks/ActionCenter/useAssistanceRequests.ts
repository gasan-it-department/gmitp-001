import { ActionCenterApi } from "@/Core/Api/ActionCenter/AssistanceRequestApi";
import { useQuery } from "@tanstack/react-query";
import type { AssistanceRequest } from "@/Core/Types/ActionCenter/AssistanceRequestTypes";

export function useAssistanceRequests() {
    return useQuery<{ request: AssistanceRequest[] }>({
        queryKey: ['request'],
        queryFn: ActionCenterApi.getAllRequest,
        refetchOnWindowFocus: false,
    });
}