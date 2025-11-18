import Feedback from "@/actions/App/External/Api/Controllers/Feedback"
import axios from "axios";

export const FeedbackApi = {
    async storeFeedback(municipalSlug: string, payload: any) {
        const { url, method } = Feedback.FeedbackController.store();

        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (key !== "feedback_files") {
                formData.append(key, value as any);
            }
        });

        if (payload.feedback_files && payload.feedback_files.length > 0) {
            payload.feedback_files.forEach((file: File) => {
                formData.append("feedback_files[]", file);
            });
        }

        const { data } = await axios({
            url,
            method,
            headers: {
                'X-Municipality-Slug': municipalSlug
            },
            data: formData
        })

        return data;
    }
}