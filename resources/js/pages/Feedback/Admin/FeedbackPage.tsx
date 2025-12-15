import { FeedbackData } from '@/Core/Types/Feedback/FeedbackTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/PaginationTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import FeedbackPageTable from './Components/FeedbackPageTable';

interface FeedbackPageProps {
    feedbacks: PaginatedResponse<FeedbackData>;
}

export default function FeedbackPage({ feedbacks }: FeedbackPageProps) {
    console.log(feedbacks);
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <FeedbackPageTable feedbacks={feedbacks} />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
