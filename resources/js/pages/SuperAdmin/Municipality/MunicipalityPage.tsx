import SuperAdminLayout from '@/layouts/App/AppLayout';
import MunicipalityPageTable from './Components/MunicipalityPageTable';

export default function MunicipalityPage() {
    return (
        <SuperAdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <MunicipalityPageTable />
                    </div>
                </div>
            </section>
        </SuperAdminLayout>
    );
}
