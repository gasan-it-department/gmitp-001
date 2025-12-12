import AdminLayout from '@/layouts/App/AppLayout';

export default function FeedbackPage({ feedbacks }: any) {
    console.log(feedbacks);
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        {/* <EventPageTable /> */}
                        {/* <FeedbackPageTable /> */}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
