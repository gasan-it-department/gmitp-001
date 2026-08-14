import { absoluteUrl, SeoSharedData } from '@/components/Seo/PublicSeo';
import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import {
    getProcurementCategoryLabel,
    getProcurementStatusLabel,
    getProcurementValue,
    ProcurementLabeledValue,
} from '@/Core/Types/Procurement/procurement';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import PublicLayout from '@/layouts/Public/PublicLayout';
import transparency from '@/routes/transparency';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Award,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    FileCheck2,
    FileSearch2,
    Landmark,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export interface PublicProcurementItem {
    id: string;
    reference_number: string;
    title: string;
    description?: string | null;
    category: ProcurementLabeledValue;
    status: ProcurementLabeledValue;
    abc_amount: number;
    department_name: string | null;
    funding_source?: string | null;
    closing_date: string | null;
    published_at: string | null;
    pre_bid_date: string | null;
    winning_bidder?: string | null;
    contract_amount?: number | null;
    awarded_date?: string | null;
    failure_reason?: string | null;
    failed_date?: string | null;
    cancellation_reason?: string | null;
}

interface SelectOption {
    value: string;
    label: string;
}

interface Props {
    procurements: PaginatedResponse<PublicProcurementItem>;
    filterOptions?: {
        categories: SelectOption[];
        statuses: SelectOption[];
    };
    activeFilters?: {
        search?: string;
        category?: string;
        status?: string;
    };
}

const fallbackCategories: SelectOption[] = [
    { value: 'goods', label: 'Goods & services' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'consulting', label: 'Consulting services' },
];

const fallbackStatuses: SelectOption[] = [
    { value: 'open', label: 'Active bidding' },
    { value: 'evaluating', label: 'Under evaluation' },
    { value: 'awarded', label: 'Awarded' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const portalHighlights = [
    {
        icon: FileSearch2,
        title: 'Bidding opportunities',
        description: 'Review public invitations, approved budgets, and important deadlines.',
    },
    {
        icon: Award,
        title: 'Award notices',
        description: 'See winning bidders and published contract information in one place.',
    },
    {
        icon: Building2,
        title: 'Project accountability',
        description: 'Know the responsible municipal office and follow each project status.',
    },
];

export default function Transparency({ procurements, filterOptions, activeFilters }: Props) {
    const { currentMunicipality, seo } = usePage<{ currentMunicipality: Municipality; seo: SeoSharedData }>().props;
    const procurementData = procurements.data;
    const transparencyUrl = absoluteUrl(`/${currentMunicipality.slug}/transparency`, seo.site_url);
    const categoryOptions = filterOptions?.categories ?? fallbackCategories;
    const statusOptions = (filterOptions?.statuses ?? fallbackStatuses).filter((option) => option.value.toLowerCase() !== 'draft');

    const [searchQuery, setSearchQuery] = useState(activeFilters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(activeFilters?.category || '');
    const [statusFilter, setStatusFilter] = useState(activeFilters?.status?.toLowerCase() === 'draft' ? '' : activeFilters?.status || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                transparency.index.url(currentMunicipality.slug),
                {
                    search: searchQuery || undefined,
                    category: categoryFilter || undefined,
                    status: statusFilter || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, categoryFilter, statusFilter, currentMunicipality.slug]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('');
        setStatusFilter('');
    };

    const hasActiveFilters = Boolean(searchQuery || categoryFilter || statusFilter);
    const totalRecords = procurements.meta?.total ?? procurementData.length;
    const visibleRange =
        totalRecords > 0 && procurements.meta ? `${procurements.meta.from}–${procurements.meta.to} of ${totalRecords}` : `${totalRecords}`;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 2,
        }).format(amount);

    const formatDate = (date: string | null) => {
        if (!date) return 'Not specified';

        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return date;

        return new Intl.DateTimeFormat('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(parsedDate);
    };

    const getStatusStyle = (status: ProcurementLabeledValue) => {
        switch (getProcurementValue(status)) {
            case 'awarded':
                return 'border-emerald-200 bg-emerald-50 text-emerald-700 before:bg-emerald-500';
            case 'open':
                return 'border-sky-200 bg-sky-50 text-sky-700 before:bg-sky-500';
            case 'evaluating':
                return 'border-amber-200 bg-amber-50 text-amber-700 before:bg-amber-500';
            case 'failed':
                return 'border-rose-200 bg-rose-50 text-rose-700 before:bg-rose-500';
            case 'cancelled':
                return 'border-slate-200 bg-slate-100 text-slate-600 before:bg-slate-400';
            default:
                return 'border-slate-200 bg-slate-50 text-slate-600 before:bg-slate-400';
        }
    };

    return (
        <PublicLayout
            title="Transparency Portal"
            description={`View public procurements, bidding opportunities, awards, and municipal projects from the Municipality of ${currentMunicipality.name}.`}
            canonicalUrl={transparencyUrl}
            structuredData={{
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: absoluteUrl(`/${currentMunicipality.slug}/home`, seo.site_url),
                    },
                    { '@type': 'ListItem', position: 2, name: 'Transparency Portal', item: transparencyUrl },
                ],
            }}
        >
            <section className="relative isolate overflow-hidden bg-[#0b1730] text-white">
                <div className="absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.28),transparent_30%),radial-gradient(circle_at_85%_65%,rgba(14,165,233,0.18),transparent_32%)] opacity-80" />
                <div className="absolute top-0 right-0 -z-10 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full border border-white/10" />
                <div className="absolute top-8 right-10 -z-10 h-48 w-48 rounded-full border border-white/10" />

                <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 pb-24 sm:px-6 md:pt-16 md:pb-28 lg:grid-cols-[1fr_360px] lg:items-center lg:gap-16 lg:px-8 lg:pt-20 lg:pb-32">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-sky-100 uppercase">
                            <Landmark className="h-3.5 w-3.5" />
                            Open Government · {currentMunicipality.name}
                        </div>
                        <h1 className="max-w-3xl font-heading text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            Public records, made easier to understand.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                            Explore how public funds are planned and awarded. Search official procurement records, check project deadlines, and follow
                            every published decision.
                        </p>

                        <div className="mt-8 max-w-3xl">
                            <label htmlFor="transparency-search" className="sr-only">
                                Search procurement records
                            </label>
                            <div className="group relative rounded-2xl bg-white p-1.5 shadow-2xl ring-1 shadow-black/20 ring-white/20 transition focus-within:ring-4 focus-within:ring-sky-400/25">
                                <Search className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="transparency-search"
                                    type="search"
                                    placeholder="Search by project, office, or reference number"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="h-12 rounded-xl border-0 bg-white pr-28 pl-12 text-sm text-slate-900 shadow-none placeholder:font-normal placeholder:text-slate-400 focus-visible:ring-0 sm:h-14 sm:text-base"
                                />
                                <span className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:inline-flex">
                                    Search
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-sky-400" /> Official municipal records
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-sky-400" /> Free public access
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-sky-400" /> Citizen-friendly details
                            </span>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="relative rounded-[2rem] border border-white/15 bg-white/[0.07] p-7 shadow-2xl shadow-black/20 backdrop-blur-sm">
                            <div className="absolute -top-5 -right-4 flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl bg-sky-500 shadow-xl shadow-sky-950/30">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <p className="text-xs font-semibold tracking-[0.18em] text-sky-300 uppercase">Transparency at a glance</p>
                            <p className="mt-4 text-5xl font-semibold tracking-tight">{totalRecords.toLocaleString()}</p>
                            <p className="mt-1 text-sm text-slate-300">published procurement {totalRecords === 1 ? 'record' : 'records'}</p>
                            <div className="mt-7 border-t border-white/10 pt-5">
                                <p className="text-sm leading-6 text-slate-300">
                                    Each listing connects citizens to the project budget, responsible office, timeline, and procurement outcome.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                    <section
                        aria-label="Filter procurement records"
                        className="relative -mt-12 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-5 lg:p-6"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                            <div className="flex items-center gap-3 lg:mr-2 lg:self-center">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Refine records</p>
                                    <p className="text-xs text-slate-500">Narrow your results</p>
                                </div>
                            </div>

                            <div className="grid flex-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="category-filter" className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Procurement category
                                    </label>
                                    <select
                                        id="category-filter"
                                        value={categoryFilter}
                                        onChange={(event) => setCategoryFilter(event.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 transition outline-none hover:border-slate-300 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                    >
                                        <option value="">All categories</option>
                                        {categoryOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="status-filter" className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Project status
                                    </label>
                                    <select
                                        id="status-filter"
                                        value={statusFilter}
                                        onChange={(event) => setStatusFilter(event.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 transition outline-none hover:border-slate-300 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                                    >
                                        <option value="">All statuses</option>
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearFilters}
                                disabled={!hasActiveFilters}
                                className="h-11 rounded-xl border-slate-200 px-4 text-slate-600 disabled:opacity-40"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear filters
                            </Button>
                        </div>
                    </section>

                    <div className="pt-10 lg:pt-12">
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.16em] text-sky-700 uppercase">Public procurement</p>
                                <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                    Published records
                                </h2>
                            </div>
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-800">{visibleRange}</span>{' '}
                                {totalRecords === 1 ? 'record' : 'records'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {procurementData.length === 0 ? (
                                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                                        <div className="flex flex-col items-center justify-center px-6 py-14 text-center sm:px-12 sm:py-16">
                                            <div className="relative mb-6">
                                                <div className="absolute inset-0 scale-150 rounded-full bg-sky-100/70 blur-xl" />
                                                <div className="relative flex h-20 w-20 rotate-2 items-center justify-center rounded-3xl border border-sky-100 bg-sky-50 text-sky-700">
                                                    <FileSearch2 className="h-9 w-9" />
                                                </div>
                                            </div>
                                            <h3 className="font-heading text-xl font-semibold text-slate-950 sm:text-2xl">
                                                {hasActiveFilters ? 'No records match your search' : 'No procurement records published yet'}
                                            </h3>
                                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                                                {hasActiveFilters
                                                    ? 'Try a broader keyword, choose a different category or status, or reset the filters to see every published record.'
                                                    : `New bidding opportunities, project notices, and award decisions from ${currentMunicipality.name} will appear here once published.`}
                                            </p>
                                            {hasActiveFilters && (
                                                <Button
                                                    type="button"
                                                    onClick={handleClearFilters}
                                                    className="mt-6 h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                                                >
                                                    Reset all filters <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="border-t border-slate-200 bg-slate-50/80 p-6 sm:p-8 lg:border-t-0 lg:border-l">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                                <CircleDollarSign className="h-5 w-5 text-sky-700" />
                                                What you can find here
                                            </div>
                                            <div className="mt-5 space-y-5">
                                                {portalHighlights.map(({ icon: Icon, title, description }) => (
                                                    <div key={title} className="flex gap-3.5">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
                                                            <Icon className="h-4 w-4" />
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{title}</p>
                                                            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                procurementData.map((item) => {
                                    const statusValue = getProcurementValue(item.status);

                                    return (
                                        <Link
                                            key={item.id}
                                            href={transparency.show.url({
                                                municipality: currentMunicipality.slug,
                                                procurementId: item.id,
                                            })}
                                            headers={{ 'X-Municipality-Slug': currentMunicipality.slug }}
                                            className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:ring-4 focus-visible:ring-sky-200 focus-visible:outline-none sm:p-6"
                                        >
                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold tracking-[0.1em] text-slate-600 uppercase">
                                                            {getProcurementCategoryLabel(item.category)}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase before:h-1.5 before:w-1.5 before:rounded-full ${getStatusStyle(item.status)}`}
                                                        >
                                                            {getProcurementStatusLabel(item.status)}
                                                        </span>
                                                    </div>

                                                    <h3 className="mt-4 max-w-3xl font-heading text-lg leading-snug font-semibold text-slate-950 transition group-hover:text-sky-800 sm:text-xl">
                                                        {item.title}
                                                    </h3>

                                                    {item.description && (
                                                        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
                                                            {item.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                                                        <span className="inline-flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-slate-400" />
                                                            {item.department_name || 'Municipal office'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-2">
                                                            <CircleDollarSign className="h-4 w-4 text-slate-400" />
                                                            {item.funding_source || 'Funding source not specified'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-2">
                                                            <FileCheck2 className="h-4 w-4 text-slate-400" />
                                                            <span className="font-mono text-xs">
                                                                {item.reference_number || 'No reference number'}
                                                            </span>
                                                        </span>
                                                        <span className="inline-flex items-center gap-2">
                                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                                            Published {formatDate(item.published_at)}
                                                        </span>
                                                    </div>

                                                    {statusValue === 'awarded' && (item.winning_bidder || item.awarded_date) && (
                                                        <div className="mt-4 flex w-fit flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                                            <Award className="h-4 w-4" />
                                                            {item.winning_bidder && (
                                                                <span>
                                                                    Awarded to <span className="font-semibold">{item.winning_bidder}</span>
                                                                </span>
                                                            )}
                                                            {item.contract_amount !== null && item.contract_amount !== undefined && (
                                                                <span className="font-semibold">{formatCurrency(item.contract_amount)}</span>
                                                            )}
                                                            {item.awarded_date && <span>on {formatDate(item.awarded_date)}</span>}
                                                        </div>
                                                    )}
                                                    {statusValue === 'failed' && item.failure_reason && (
                                                        <div className="mt-4 inline-flex max-w-2xl items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                                            <span className="line-clamp-1">
                                                                {item.failure_reason}
                                                                {item.failed_date ? ` · ${formatDate(item.failed_date)}` : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {statusValue === 'cancelled' && item.cancellation_reason && (
                                                        <div className="mt-4 inline-flex max-w-2xl items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
                                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                                            <span className="line-clamp-1">{item.cancellation_reason}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 items-end justify-between gap-4 border-t border-slate-100 pt-4 lg:min-w-60 lg:flex-col lg:items-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
                                                    <div className="lg:text-right">
                                                        <p className="text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
                                                            Approved budget
                                                        </p>
                                                        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                                                            {formatCurrency(item.abc_amount)}
                                                        </p>
                                                        {['open', 'evaluating'].includes(statusValue) && item.closing_date && (
                                                            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Clock3 className="h-3.5 w-3.5" /> Closes {formatDate(item.closing_date)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 transition group-hover:gap-2">
                                                        View record <ChevronRight className="h-4 w-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>

                        {procurements.meta && procurements.meta.last_page > 1 && (
                            <div className="mt-8 flex justify-center overflow-x-auto pb-4">
                                <Pagination links={procurements.meta.links} />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}
