import AdminLayout from '@/layouts/App/AppLayout';
import CitizenCharterTable from './Components/CitizenCharterTable';
import InDevelopmentView from '@/pages/Utility/InDevelopmentView/InDevelopementView';

export default function BiddingPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <InDevelopmentView title="Citizen's Charter" description="This page is currently being built. We’re working to make it available as soon as possible." />
                        {/* <CitizenCharterTable /> */}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}