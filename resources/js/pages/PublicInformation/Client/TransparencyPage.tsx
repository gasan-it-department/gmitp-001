import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import transparency from '@/routes/transparency';
import { Link, router, usePage } from '@inertiajs/react';
import { Building2, Calendar, FileText, Search, X, Award, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

// Adjusted PublicProcurementItem to match the backend Resource
export interface PublicProcurementItem {
    id: string;
    reference_number: string;
    title: string;
    category: any;
    status: any;
    abc_amount: number;
    department_name: string;
    closing_date: string | null;
    published_at: string | null;
    pre_bid_date: string | null;
    winning_bidder?: string;
    contract_amount?: number;
    awarded_date?: string | null;
    failure_reason?: string;
    failed_date?: string | null;
}

interface Props {
    procurements: PaginatedResponse<PublicProcurementItem>;
    filterOptions?: {
        categories: { value: string; label: string }[];
        statuses: { value: string; label: string }[];
    };
    activeFilters?: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function Transparency({ procurements, filterOptions, activeFilters }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const procurementData = procurements.data;

    // --- PUBLIC FILTER STATE ---
    const [searchQuery, setSearchQuery] = useState(activeFilters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(activeFilters?.category || '');
    const [statusFilter, setStatusFilter] = useState(activeFilters?.status || '');

    // --- INERTIA SYNC ENGINE ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const queryParams = {
                search: searchQuery || undefined,
                category: categoryFilter || undefined,
                status: statusFilter || undefined,
            };

            router.get(transparency.index.url(currentMunicipality.slug), queryParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, categoryFilter, statusFilter]);

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

    const getStatusString = (status: any) => {
        if (!status) return 'unknown';
        return typeof status === 'string' ? status : status.value || status.name || 'unknown';
    };

    const getStatusLabel = (status: any) => {
        if (!status) return 'Unknown';
        return typeof status === 'string' ? status : status.label || status.name || status.value || 'Unknown';
    };

    const getCategoryString = (category: any) => {
        if (!category) return 'unknown';
        return typeof category === 'string' ? category : category.value || category.name || 'unknown';
    };

    const getStatusColor = (status: any) => {
        const val = getStatusString(status).toLowerCase();
        switch (val) {
            case 'awarded':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'open':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'evaluating':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'draft':
                return 'bg-slate-100 text-slate-800 border-slate-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <PublicLayout title="Bids and Awards" description="Track public procurements and municipal projects.">
            {/* 1. THE HERO SECTION */}
            <div className="bg-slate-900 px-4 py-12 text-center text-white md:px-12 md:py-16">
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Transparency Portal</h1>
                <p className="mx-auto mt-3 max-w-2xl text-base text-slate-300 md:mt-4 md:text-lg">
                    Search and track public bidding, infrastructure projects, and municipal procurements.
                </p>

                {/* Omni-Search Bar (Mobile First) */}
                <div className="mx-auto mt-6 max-w-3xl md:mt-8">
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search projects, PhilGEPS REF..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 w-full rounded-full border-0 bg-white pr-4 pl-12 text-sm text-slate-900 shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-500 md:h-14 md:text-base uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* 2. THE MAIN CONTENT AREA */}
            <div className="mx-auto max-w-5xl px-4 py-8 md:py-12 lg:px-8">
                {/* Responsive Filters */}
                <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center md:mb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 sm:h-10 sm:w-48"
                        >
                            <option value="">All Categories</option>
                            <option value="goods">Goods & Services</option>
                            <option value="infrastructure">Infrastructure</option>
                            <option value="consulting">Consulting</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 sm:h-10 sm:w-48"
                        >
                            <option value="">All Statuses</option>
                            <option value="open">Active Bidding</option>
                            <option value="evaluating">Under Evaluation</option>
                            <option value="awarded">Awarded</option>
                            <option value="failed">Failed/Cancelled</option>
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={handleClearFilters} className="text-slate-500 w-full sm:w-auto">
                            <X className="mr-2 h-4 w-4" /> Clear Filters
                        </Button>
                    )}
                </div>

                {/* 3. THE VERTICAL CARD LIST (Mobile First Design) */}
                <div className="space-y-4">
                    {procurementData.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-16 text-center shadow-sm">
                            <FileText className="mx-auto h-12 w-12 text-slate-300" />
                            <h3 className="mt-4 text-base font-semibold text-slate-900 md:text-lg">No projects found</h3>
                            <p className="mt-2 text-sm text-slate-500 md:text-base">Try adjusting your search or clearing your filters.</p>
                        </div>
                    ) : (
                        procurementData.map((item) => (
                            <Link
                                key={item.id}
                                href={transparency.show.url({
                                    municipality: currentMunicipality.slug,
                                    procurementId: item.id,
                                })}
                                headers={{
                                    'X-Municipality-Slug': currentMunicipality.slug,
                                }}
                                className="group block overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md md:p-6"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    {/* Left Side: Info */}
                                    <div className="flex-1 space-y-2 md:space-y-3">
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 md:text-sm">
                                            <span className="font-semibold tracking-wider text-indigo-600 uppercase">
                                                {getCategoryString(item.category)}
                                            </span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Published {item.published_at || 'N/A'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold leading-tight text-slate-900 group-hover:text-indigo-700 md:text-xl">
                                            {item.title}
                                        </h3>

                                        <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:gap-4 md:text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span className="truncate">{item.department_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-slate-400">REF:</span>
                                                <span className="truncate">{item.reference_number}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Status specific extra info below the title */}
                                        {getStatusString(item.status).toLowerCase() === 'awarded' && item.winning_bidder && (
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 w-fit px-2 py-1 rounded md:text-sm">
                                                <Award className="h-3.5 w-3.5" />
                                                Awarded to: <span className="font-semibold">{item.winning_bidder}</span>
                                            </div>
                                        )}
                                        {getStatusString(item.status).toLowerCase() === 'failed' && item.failure_reason && (
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-700 bg-red-50 w-fit px-2 py-1 rounded md:text-sm">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span className="line-clamp-1">{item.failure_reason}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side: Status & Budget */}
                                    <div className="flex flex-col items-start gap-2 border-t border-slate-100 pt-4 md:items-end md:border-0 md:pt-0">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase md:px-3 md:py-1 md:text-xs ${getStatusColor(item.status)}`}
                                        >
                                            {getStatusLabel(item.status)}
                                        </span>

                                        <div className="text-left md:text-right w-full">
                                            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase md:text-xs">Approved Budget</p>
                                            <p className="mt-0.5 font-mono text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                                                {formatCurrency(item.abc_amount)}
                                            </p>
                                        </div>
                                        
                                        {/* Closing / Pre-bid context based on status */}
                                        {['open', 'evaluating'].includes(getStatusString(item.status).toLowerCase()) && item.closing_date && (
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500 md:text-xs">
                                                <Clock className="h-3 w-3" />
                                                Closes: {item.closing_date}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* 4. Pagination */}
                {procurements.meta && procurements.meta.last_page > 1 && (
                    <div className="mt-8 flex justify-center overflow-x-auto pb-4">
                        <Pagination links={procurements.meta.links} />
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
