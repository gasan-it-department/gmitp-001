import { AwardsData } from '@/Core/Types/PublicInformation/PublicInformationTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import AwardsTable from './Components/AwardsTable';

interface PageProps {
    procurements: {
        data: AwardsData[];
        meta: any;
        links: any;
    };
}

export default function AwardsPage({ procurements }: PageProps) {
    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <AwardsTable data={procurements.data} pagination={procurements.meta} />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
