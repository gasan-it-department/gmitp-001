import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { FeedbackFormData } from "@/Core/Types/Feedback/FeedbackTypes";
import { useState } from "react";

export default function ViewingFeedbackPage() {
    const [feedbackList, setFeeedbackList] = useState<FeedbackFormData>();
    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold text-gray-800">Feedback Overview</h1>

            
        </div>
    );
}
