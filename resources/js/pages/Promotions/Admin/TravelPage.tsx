import AdminLayout from '@/layouts/App/AppLayout';
import InDevelopmentView from '@/pages/Utility/InDevelopmentView/InDevelopementView';
export default function TravelPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <InDevelopmentView
                            title="Travel Editor"
                            description="This page is currently being built. We’re working to make it available as soon as possible."
                        />
                        {/* <TravelPageEditor /> */}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
