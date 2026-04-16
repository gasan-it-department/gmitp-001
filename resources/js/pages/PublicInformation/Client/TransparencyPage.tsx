import { Pagination } from '@/components/Shared/Pagination'; // Assuming you have this!
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Link, router } from '@inertiajs/react';
import { Building2, Calendar, FileText, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// 🌟 1. Use the specific Public Type we designed!
export interface PublicProcurementItem {
    id: string;
    reference_number: string;
    title: string;
    category: string;
    status: string;
    abc_amount: number;
    department_name: string;
    closing_date: string | null;
    published_at: string | null;
    winning_bidder?: string;
    contract_amount?: number;
}

interface Props {
    municipalitySlug: string;
    procurements: PaginatedResponse<PublicProcurementItem>;
    filters?: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function Transparency({ municipalitySlug, procurements, filters }: Props) {
    const procurementData = procurements.data;

    // --- PUBLIC FILTER STATE ---
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    // --- INERTIA SYNC ENGINE ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const queryParams = {
                search: searchQuery || undefined,
                category: categoryFilter || undefined,
                status: statusFilter || undefined,
            };

            router.get(`/transparency/${municipalitySlug}`, queryParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, categoryFilter, statusFilter, municipalitySlug]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('');
        setStatusFilter('');
    };

    const hasActiveFilters = searchQuery || categoryFilter || statusFilter;

    // --- HELPERS ---
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'awarded':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'open':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'evaluating':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <PublicLayout title="Bids and Awards" description="Track public procurements and municipal projects.">
            {/* 1. THE HERO SECTION */}
            <div className="bg-slate-900 px-6 py-16 text-center text-white sm:px-12">
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Transparency Portal</h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                    Search and track public bidding, infrastructure projects, and municipal procurements in real-time.
                </p>

                {/* Omni-Search Bar */}
                <div className="mx-auto mt-8 max-w-3xl">
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search by project title, PhilGEPS reference, or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 w-full rounded-full border-0 bg-white pr-4 pl-12 text-lg text-slate-900 shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* 2. THE MAIN CONTENT AREA */}
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Simplified Public Filters */}
                <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex w-full items-center gap-3 sm:w-auto">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 sm:w-48"
                        >
                            <option value="">All Categories</option>
                            <option value="goods">Goods & Services</option>
                            <option value="infrastructure">Infrastructure</option>
                            <option value="consulting">Consulting</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 sm:w-48"
                        >
                            <option value="">All Statuses</option>
                            <option value="open">Active Bidding</option>
                            <option value="evaluating">Under Evaluation</option>
                            <option value="awarded">Awarded</option>
                            <option value="failed">Failed/Cancelled</option>
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={handleClearFilters} className="text-slate-500">
                            <X className="mr-2 h-4 w-4" /> Clear Filters
                        </Button>
                    )}
                </div>

                {/* 3. THE VERTICAL CARD LIST */}
                <div className="space-y-4">
                    {procurementData.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white py-20 text-center shadow-sm">
                            <FileText className="mx-auto h-12 w-12 text-slate-300" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">No projects found</h3>
                            <p className="mt-2 text-slate-500">Try adjusting your search or clearing your filters.</p>
                        </div>
                    ) : (
                        procurementData.map((item) => (
                            <Link
                                key={item.id}
                                // Replace with your actual route helper
                                href={`/transparency/${municipalitySlug}/procurement/${item.id}`}
                                className="group block overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                            >
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    {/* Left Side: Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="font-semibold tracking-wider text-indigo-600 uppercase">{item.category}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Published {item.published_at}
                                            </span>
                                        </div>

                                        <h3 className="mt-2 text-xl font-bold text-slate-900 group-hover:text-indigo-700">{item.title}</h3>

                                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="h-4 w-4 text-slate-400" />
                                                {item.department_name}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs text-slate-400">REF:</span>
                                                {item.reference_number}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Status & Budget */}
                                    <div className="flex flex-col items-start gap-3 border-t border-slate-100 pt-4 sm:items-end sm:border-0 sm:pt-0">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${getStatusColor(item.status)}`}
                                        >
                                            {item.status}
                                        </span>

                                        <div className="text-left sm:text-right">
                                            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Approved Budget</p>
                                            <p className="mt-0.5 font-mono text-2xl font-bold tracking-tight text-slate-900">
                                                {formatCurrency(item.abc_amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* 4. Pagination */}
                {procurements.meta && procurements.meta.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination links={procurements.meta.links} />
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
