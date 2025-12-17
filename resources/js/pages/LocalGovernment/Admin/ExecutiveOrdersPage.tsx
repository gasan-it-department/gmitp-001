import AdminLayout from '@/layouts/App/AppLayout';
import ExecutiveOrdersTable from './Components/ExecutiveOrdersTable';
import InDevelopmentView from '@/pages/Utility/InDevelopmentView/InDevelopementView';

export default function ExecutiveOrdersPage() {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <InDevelopmentView title="Executive Orders" description="This page is currently being built. We’re working to make it available as soon as possible." />
                        {/* <ExecutiveOrdersTable /> */}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}