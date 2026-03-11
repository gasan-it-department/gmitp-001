import { Pagination } from '@/components/Shared/Pagination';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import { OfficialListItem } from './Components/OfficialListItem';
import { OfficialTableFilters } from './Components/OfficialTableFilters';

interface Props {
    officials?: PaginatedResponse<Official>;
    filters?: any; // The raw object from Laravel $request->query()
}

export default function OfficialsList({ officials, filters }: Props) {
    const data = officials?.data || [];
    console.log(data);
    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50 p-8 dark:bg-zinc-950">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Official Profiles Directory</h1>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 dark:bg-zinc-900 dark:ring-zinc-800">
                        {/* THE UNIFIED FILTER BAR */}
                        <OfficialTableFilters filters={filters} />

                        <ul role="list" className="divide-y divide-slate-200 dark:divide-zinc-800">
                            {data.map((official) => (
                                <OfficialListItem key={official.id} official={official} />
                            ))}
                            {data.length === 0 && (
                                <li className="px-4 py-12 text-center text-sm text-slate-500">No official profiles found matching your filters.</li>
                            )}
                        </ul>
                    </div>
                    <div className="mt-6">
                        <Pagination links={officials?.meta.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
