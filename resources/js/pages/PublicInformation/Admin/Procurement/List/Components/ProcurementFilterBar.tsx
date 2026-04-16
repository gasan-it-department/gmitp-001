import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Department } from '@/Core/Types/Department/department';
import { Category, FundingSource, ProcurementStatus } from '@/Core/Types/Procurement/procurement';
import procurement from '@/routes/procurement';
import { router } from '@inertiajs/react';
import { Filter, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FilterBarProps {
    municipalitySlug: string;
    departments: Department[];
    fundingSources: FundingSource[];
    categories: Category[];
    statuses: ProcurementStatus[];
    initialFilters?: {
        search?: string;
        status?: string;
        category?: string;
        department?: string;
        funding?: string;
    };
}

export default function ProcurementFilterBar({
    municipalitySlug,
    departments,
    fundingSources,
    categories,
    statuses,
    initialFilters,
}: FilterBarProps) {
    // --- FILTER STATE (Using empty strings as the default "All" state) ---
    const [searchQuery, setSearchQuery] = useState(initialFilters?.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters?.status || '');
    const [categoryFilter, setCategoryFilter] = useState(initialFilters?.category || '');
    const [departmentFilter, setDepartmentFilter] = useState(initialFilters?.department || '');
    const [fundingFilter, setFundingFilter] = useState(initialFilters?.funding || '');

    // --- INERTIA SYNC ENGINE ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const queryParams = {
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                category: categoryFilter || undefined,
                department: departmentFilter || undefined,
                funding: fundingFilter || undefined,
            };

            router.get(procurement.admin.page.url({ municipality: municipalitySlug }), queryParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, statusFilter, categoryFilter, departmentFilter, fundingFilter]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setCategoryFilter('');
        setDepartmentFilter('');
        setFundingFilter('');
    };

    const hasActiveFilters = searchQuery || statusFilter || categoryFilter || departmentFilter || fundingFilter;

    return (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            {/* Left: Fixed-width Search */}
            <div className="relative w-[350px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                    type="text"
                    placeholder="Search title, ref number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-slate-200 bg-slate-50 pl-9 focus-visible:ring-indigo-500"
                />
            </div>

            {/* Right: Inline Dropdowns & Actions */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border-r border-slate-200 pr-2">
                    <Filter className="mr-1 h-4 w-4 text-slate-400" />

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:border-indigo-500 focus:ring-1"
                    >
                        <option value="">Status: All</option>
                        {statuses.map((status: any) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>

                    {/* Category */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="h-9 cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:border-indigo-500 focus:ring-1"
                    >
                        <option value="">Category: All</option>
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>

                    {/* Department */}
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="h-9 w-36 cursor-pointer truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:border-indigo-500 focus:ring-1"
                    >
                        <option value="">Dept: All</option>
                        {departments?.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>

                    {/* Funding Source */}
                    <select
                        value={fundingFilter}
                        onChange={(e) => setFundingFilter(e.target.value)}
                        className="h-9 w-36 cursor-pointer truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:border-indigo-500 focus:ring-1"
                    >
                        <option value="">Fund: All</option>
                        {fundingSources?.map((fund) => (
                            <option key={fund.id} value={fund.id}>
                                {fund.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters Button */}
                <div className="w-[85px]">
                    {hasActiveFilters ? (
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 w-full text-slate-500 hover:text-slate-900">
                            <X className="mr-1 h-4 w-4" /> Clear
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
