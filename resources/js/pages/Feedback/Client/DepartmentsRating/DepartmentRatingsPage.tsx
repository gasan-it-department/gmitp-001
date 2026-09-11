import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import feedbackRoutes from '@/routes/feedback';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    MessageSquareHeart,
    Search,
    ShieldCheck,
    Star,
    UsersRound,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type RatingDistribution = {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
};

type DepartmentRating = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    logo_url: string | null;
    feedback_count: number;
    average_rating: number | null;
    rating_label: string;
    latest_feedback_at: string | null;
    distribution: RatingDistribution;
    is_public: boolean;
};

type RatingsSummary = {
    active_departments: number;
    rated_departments: number;
    total_public_feedback_count: number;
    average_rating: number | null;
};

type DepartmentView = 'all' | 'rated' | 'collecting';
type SortOption = 'rating' | 'feedback' | 'name';

interface DepartmentRatingsPageProps {
    departments: DepartmentRating[];
    summary: RatingsSummary;
    minimum_feedback_count: number;
}

const distributionColors: Record<keyof RatingDistribution, string> = {
    5: 'bg-emerald-500',
    4: 'bg-teal-500',
    3: 'bg-amber-400',
    2: 'bg-orange-400',
    1: 'bg-rose-500',
};

const formatRating = (rating: number | null) => (rating === null ? '-' : rating.toFixed(1));

const formatDate = (date: string | null) => {
    if (!date) {
        return null;
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
};

const RatingStars = ({ rating, size = 'sm' }: { rating: number | null; size?: 'sm' | 'md' }) => (
    <div className="flex items-center gap-1" aria-label={rating === null ? 'Rating unavailable' : `${rating.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                aria-hidden="true"
                className={`${size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} ${
                    rating !== null && star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'
                }`}
            />
        ))}
    </div>
);

const DistributionBars = ({ distribution, total }: { distribution: RatingDistribution; total: number }) => (
    <div className="space-y-2.5" aria-label="Rating distribution">
        {[5, 4, 3, 2, 1].map((rating) => {
            const key = rating as keyof RatingDistribution;
            const count = distribution[key];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
                <div key={rating} className="grid grid-cols-[1.75rem_1fr_2.5rem] items-center gap-2.5 text-xs">
                    <span className="flex items-center gap-1 font-bold text-slate-600">
                        {rating}
                        <Star className="h-3 w-3 fill-slate-300 text-slate-300" aria-hidden="true" />
                    </span>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full ${distributionColors[key]} transition-[width] duration-500`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-right font-semibold text-slate-500 tabular-nums">{count}</span>
                </div>
            );
        })}
    </div>
);

const SummaryMetric = ({ icon: Icon, label, value, accent }: { icon: typeof BarChart3; label: string; value: string | number; accent: string }) => (
    <div className="flex min-w-0 items-center gap-3 px-4 py-4 sm:px-6">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
            <p className="truncate text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</p>
            <p className="mt-0.5 text-xl font-black text-slate-950 tabular-nums">{value}</p>
        </div>
    </div>
);

export default function DepartmentRatingsPage({ departments, summary, minimum_feedback_count }: DepartmentRatingsPageProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const [search, setSearch] = useState('');
    const [view, setView] = useState<DepartmentView>('all');
    const [sort, setSort] = useState<SortOption>('rating');

    const visibleDepartments = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        return departments
            .filter((department) => {
                const matchesSearch =
                    query.length === 0 || department.name.toLocaleLowerCase().includes(query) || department.code.toLocaleLowerCase().includes(query);
                const matchesView = view === 'all' || (view === 'rated' && department.is_public) || (view === 'collecting' && !department.is_public);

                return matchesSearch && matchesView;
            })
            .sort((first, second) => {
                if (sort === 'name') {
                    return first.name.localeCompare(second.name);
                }

                if (sort === 'feedback') {
                    return second.feedback_count - first.feedback_count || first.name.localeCompare(second.name);
                }

                return (
                    (second.average_rating ?? -1) - (first.average_rating ?? -1) ||
                    second.feedback_count - first.feedback_count ||
                    first.name.localeCompare(second.name)
                );
            });
    }, [departments, search, sort, view]);

    const clearFilters = () => {
        setSearch('');
        setView('all');
        setSort('rating');
    };

    const hasFilters = search.trim() !== '' || view !== 'all' || sort !== 'rating';

    return (
        <PublicLayout title="Department Ratings" description="Public service ratings by department">
            <Head title="Department Ratings" />

            <main className="min-h-[calc(100vh-5rem)] bg-slate-50">
                <section className="border-b border-slate-800 bg-slate-950 text-white">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8">
                        <div className="max-w-3xl">
                            <Link
                                href={`/${slug}/home`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Bumalik sa Home
                            </Link>

                            <div className="mt-8 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
                                    <BarChart3 className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <p className="text-xs font-bold tracking-[0.16em] text-amber-300 uppercase">Service transparency</p>
                            </div>
                            <h1 className="mt-4 text-3xl font-black tracking-normal sm:text-4xl">Mga Rating ng Departamento</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                Tingnan kung paano sinusuri ng mamamayan ang serbisyo ng mga departamento ng {currentMunicipality.name}.
                                Pinagsama-sama ang mga rating upang mapanatiling pribado ang bawat tugon.
                            </p>
                        </div>

                        <div className="border-l-4 border-amber-400 pl-5 sm:pl-6 lg:min-w-72">
                            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Overall service rating</p>
                            <div className="mt-2 flex items-end gap-2">
                                <span className="text-5xl font-black text-white tabular-nums">{formatRating(summary.average_rating)}</span>
                                <span className="pb-1.5 text-sm font-bold text-slate-400">out of 5</span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <RatingStars rating={summary.average_rating} size="md" />
                                <span className="text-xs font-semibold text-slate-400">{summary.total_public_feedback_count} public responses</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-200 px-0 sm:px-2 lg:grid-cols-4 lg:divide-y-0 lg:px-4">
                        <SummaryMetric
                            icon={BarChart3}
                            label="Overall rating"
                            value={formatRating(summary.average_rating)}
                            accent="bg-amber-50 text-amber-700"
                        />
                        <SummaryMetric
                            icon={CheckCircle2}
                            label="Publicly rated"
                            value={summary.rated_departments}
                            accent="bg-emerald-50 text-emerald-700"
                        />
                        <SummaryMetric icon={Building2} label="Departments" value={summary.active_departments} accent="bg-sky-50 text-sky-700" />
                        <SummaryMetric
                            icon={MessageSquareHeart}
                            label="Public feedback"
                            value={summary.total_public_feedback_count}
                            accent="bg-rose-50 text-rose-700"
                        />
                    </div>
                </section>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <section className="flex flex-col gap-4 border-b border-emerald-200 bg-emerald-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                            <div>
                                <h2 className="text-sm font-bold text-emerald-950">Protected and fair public results</h2>
                                <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-900/80">
                                    Ratings appear after at least <strong>{minimum_feedback_count}</strong> responses. Messages, employee names, and
                                    submitter details remain private.
                                </p>
                            </div>
                        </div>
                        <Button asChild className="shrink-0 bg-emerald-800 text-white hover:bg-emerald-900">
                            <Link href={feedbackRoutes.create.url({ municipality: slug })}>
                                Magbigay ng feedback
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </Button>
                    </section>

                    <section className="mt-9" aria-labelledby="department-results-heading">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Department scorecard</p>
                                <h2 id="department-results-heading" className="mt-2 text-2xl font-black tracking-normal text-slate-950">
                                    Ihambing ang mga serbisyo
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    {visibleDepartments.length} of {departments.length} departments shown
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[minmax(16rem,1fr)_13rem] xl:w-[35rem]">
                                <div className="relative">
                                    <Search
                                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search department or code"
                                        aria-label="Search departments"
                                        className="h-10 bg-white pr-9 pl-9"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-slate-400 transition-colors hover:text-slate-900"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>

                                <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                                    <SelectTrigger className="h-10 w-full bg-white" aria-label="Sort departments">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rating">Highest rated</SelectItem>
                                        <SelectItem value="feedback">Most feedback</SelectItem>
                                        <SelectItem value="name">Department name</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-3">
                            <div
                                className="inline-flex max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-1"
                                role="group"
                                aria-label="Rating status"
                            >
                                {(
                                    [
                                        ['all', 'All', departments.length],
                                        ['rated', 'Published', summary.rated_departments],
                                        ['collecting', 'Gathering responses', departments.length - summary.rated_departments],
                                    ] as const
                                ).map(([value, label, count]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setView(value)}
                                        className={`min-h-8 shrink-0 px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
                                            view === value ? 'rounded-md bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-950'
                                        }`}
                                        aria-pressed={view === value}
                                    >
                                        {label} <span className={view === value ? 'text-slate-300' : 'text-slate-400'}>{count}</span>
                                    </button>
                                ))}
                            </div>

                            {hasFilters && (
                                <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="text-slate-600">
                                    <X className="h-4 w-4" aria-hidden="true" />
                                    Clear filters
                                </Button>
                            )}
                        </div>

                        {departments.length === 0 ? (
                            <div className="mt-6 flex min-h-80 flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-6 text-center">
                                <Building2 className="h-11 w-11 text-slate-300" aria-hidden="true" />
                                <h3 className="mt-4 text-lg font-bold text-slate-950">Wala pang departamento</h3>
                                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Kapag may active departments at sapat na feedback, lalabas dito ang public service ratings.
                                </p>
                            </div>
                        ) : visibleDepartments.length === 0 ? (
                            <div className="mt-6 flex min-h-72 flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-6 text-center">
                                <Search className="h-10 w-10 text-slate-300" aria-hidden="true" />
                                <h3 className="mt-4 text-lg font-bold text-slate-950">Walang tumutugmang departamento</h3>
                                <p className="mt-2 text-sm text-slate-500">Subukan ang ibang keyword o rating status.</p>
                                <Button type="button" variant="outline" className="mt-5" onClick={clearFilters}>
                                    Clear filters
                                </Button>
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                {visibleDepartments.map((department) => {
                                    const latestFeedback = formatDate(department.latest_feedback_at);
                                    const responsesNeeded = Math.max(minimum_feedback_count - department.feedback_count, 0);
                                    const thresholdProgress = Math.min((department.feedback_count / minimum_feedback_count) * 100, 100);

                                    return (
                                        <article
                                            key={department.id}
                                            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                                                <div className="flex min-w-0 items-start gap-4">
                                                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-slate-600 sm:h-16 sm:w-16">
                                                        <Building2 className="h-6 w-6" aria-hidden="true" />
                                                        {department.logo_url && (
                                                            <img
                                                                src={department.logo_url}
                                                                alt={`${department.name} logo`}
                                                                className="absolute inset-0 h-full w-full bg-white object-contain p-1.5"
                                                                onError={(event) => {
                                                                    event.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-xs font-black tracking-[0.12em] text-primary uppercase">
                                                                {department.code}
                                                            </span>
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                                                    department.is_public
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                            >
                                                                {department.is_public ? 'Published' : 'Gathering responses'}
                                                            </span>
                                                        </div>
                                                        <h3 className="mt-1.5 text-base font-black tracking-normal text-slate-950 sm:text-lg">
                                                            {department.name}
                                                        </h3>
                                                        {department.description && (
                                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                                                {department.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 border-l border-slate-200 pl-4 text-right">
                                                    <p className="text-3xl font-black text-slate-950 tabular-nums sm:text-4xl">
                                                        {formatRating(department.average_rating)}
                                                    </p>
                                                    <p className="mt-0.5 text-xs font-bold text-slate-400">OUT OF 5</p>
                                                </div>
                                            </div>

                                            {department.is_public ? (
                                                <div className="grid gap-5 border-t border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-[0.8fr_1.2fr] sm:p-6">
                                                    <div className="flex flex-col justify-between">
                                                        <div>
                                                            <RatingStars rating={department.average_rating} />
                                                            <p className="mt-2 text-sm font-black text-slate-800">{department.rating_label}</p>
                                                        </div>
                                                        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
                                                                {department.feedback_count} responses
                                                            </span>
                                                            {latestFeedback && (
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                                                                    Updated {latestFeedback}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <DistributionBars distribution={department.distribution} total={department.feedback_count} />
                                                </div>
                                            ) : (
                                                <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                                        <span className="font-bold text-slate-700">Public rating threshold</span>
                                                        <span className="font-semibold text-slate-500 tabular-nums">
                                                            {department.feedback_count} / {minimum_feedback_count} responses
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                                        <div
                                                            className="h-full rounded-full bg-sky-600 transition-[width] duration-500"
                                                            style={{ width: `${thresholdProgress}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-500">
                                                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                                                        <p>
                                                            {responsesNeeded} {responsesNeeded === 1 ? 'more response is' : 'more responses are'}{' '}
                                                            needed before this rating can be published.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </PublicLayout>
    );
}
