import { Pagination } from '@/components/Shared/Pagination';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { ProcurementListItem } from '@/Core/Types/Procurement/procurement';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import procurement from '@/routes/procurement';
import { Link, usePage } from '@inertiajs/react';
import { History, Plus } from 'lucide-react';
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
                        <p className="text-sm text-gray-500">Manage and view all procurements in the municipality of {currentMunicipality.name}.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Secondary Action: Encode Past Record */}
                        <Link
                            // Append a query parameter here to tell the next page what to do
                            href={`${procurement.admin.create.url(currentMunicipality.slug)}?type=historical`}
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                        >
                            <History size={16} />
                            Encode Past Record
                        </Link>

                        {/* Primary Action: Add New Procurement */}
                        <Link
                            // Standard URL for a brand new request
                            href={procurement.admin.create.url(currentMunicipality.slug)}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                        >
                            <Plus size={16} />
                            Add New Procurement
                        </Link>
                    </div>
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
