import { Pagination } from '@/components/Shared/Pagination';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react'; // Added icon for UX
import { DecedentsTable } from './Components/DecedentsTable';

interface Props {
    decedents: PaginatedResponse<DecedentListItem>;
    filters?: any;
}

export default function ListDecedents({ decedents }: Props) {
    const decedentsData = decedents.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    return (
        <AppLayout>
            <div className="m-5 mt-0 grid grid-cols-1 bg-white">
                {/* Table Toolbar Container */}
                <div className="my-5 flex items-center justify-between">
                    {/* Left Side: Future Search/Filter Bar */}
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-800">Decedents Registry</h2>
                        <p className="text-sm text-gray-500">Manage and view all registered decedents in the municipality.</p>
                    </div>

                    {/* Right Side: Primary Action */}
                    <Link
                        href={cemetery.admin.decedents.create.page.url(currentMunicipality.slug)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    >
                        <Plus size={16} />
                        Register Decedent
                    </Link>
                </div>

                <div>
                    {/* 1. Pass data to table */}
                    <DecedentsTable decedents={decedentsData} />

                    {/* 2. ADD PAGINATION HERE */}
                    <div className="mt-4">
                        <Pagination links={decedents.meta.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
