import { Pagination } from '@/components/Shared/Pagination';
import { Department } from '@/Core/Types/Department/department';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Category, FundingSource, ProcurementListItem, ProcurementStatus } from '@/Core/Types/Procurement/procurement';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import procurement from '@/routes/procurement';
import { Link, usePage } from '@inertiajs/react';
import { History, Plus } from 'lucide-react';
import ProcurementFilterBar from './Components/ProcurementFilterBar'; // 🌟 Import your new component
import ProcurementTable from './Components/ProcurementTable';

interface Props {
    procurements: PaginatedResponse<ProcurementListItem>;
    departments: { data: Department[] };
    fundingSources: { data: FundingSource[] };
    categories: Category[];
    statuses: ProcurementStatus[];
    filters?: {
        search?: string;
        status?: string;
        category?: string;
        department?: string;
        funding?: string;
    };
}

export default function BiddingPage({ procurements, departments, fundingSources, categories, statuses, filters }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    return (
        <AppLayout>
            <div className="mx-auto min-h-screen w-full bg-slate-50/50 p-8">
                {/* 1. Page Header & Actions */}
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Procurements</h2>
                        <p className="mt-1 text-sm text-slate-500">Manage and track all bidding activities for {currentMunicipality.name}.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`${procurement.admin.create.url(currentMunicipality.slug)}?type=historical`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <History size={16} className="text-slate-500" />
                            Encode Past Record
                        </Link>
                        <Link
                            href={procurement.admin.create.url(currentMunicipality.slug)}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            <Plus size={16} />
                            Add New Procurement
                        </Link>
                    </div>
                </div>

                {/* 2. THE EXTRACTED FILTER BAR */}
                <ProcurementFilterBar
                    municipalitySlug={currentMunicipality.slug}
                    departments={departments.data}
                    fundingSources={fundingSources.data}
                    categories={categories}
                    statuses={statuses}
                    initialFilters={filters}
                />

                {/* 3. The Data Table */}
                <div className="">
                    <ProcurementTable procurements={procurements.data} />
                </div>

                {/* 4. Pagination */}
                <div className="mt-4 flex justify-end">
                    <Pagination links={procurements.meta.links} />
                </div>
            </div>
        </AppLayout>
    );
}
