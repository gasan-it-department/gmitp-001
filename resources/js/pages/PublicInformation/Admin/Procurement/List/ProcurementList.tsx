import { Pagination } from '@/components/Shared/Pagination';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { ProcurementListItem } from '@/Core/Types/PublicInformation/PublicInformationTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import procurement from '@/routes/procurement';
import { Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import ProcurementTable from './Components/ProcurementTable';

interface Props {
    procurements: PaginatedResponse<ProcurementListItem>;
    filter?: any;
}

export default function BiddingPage({ procurements }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const ProcurementData = procurements.data;
    return (
        <AppLayout>
            <div className="m-5 mt-0 grid grid-cols-1 bg-white">
                {/* Table Toolbar Container */}
                <div className="my-5 flex items-center justify-between">
                    {/* Left Side: Future Search/Filter Bar */}
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-800">Procurements</h2>
                        <p className="text-sm text-gray-500">Manage and view all registered decedents in the municipality.</p>
                    </div>

                    {/* Right Side: Primary Action */}
                    <Link
                        href={procurement.admin.create.url(currentMunicipality.slug)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    >
                        <Plus size={16} />
                        Add new Procurement
                    </Link>
                </div>

                <div>
                    <ProcurementTable procurements={ProcurementData} />
                    <div className="mt-4">
                        <Pagination links={procurements.meta.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
