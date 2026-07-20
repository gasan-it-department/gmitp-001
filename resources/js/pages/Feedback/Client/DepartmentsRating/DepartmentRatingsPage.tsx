import { Card, CardContent } from '@/components/ui/card';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Building2, MessageSquareHeart, ShieldCheck, Star } from 'lucide-react';

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

interface DepartmentRatingsPageProps {
    departments: DepartmentRating[];
    summary: RatingsSummary;
    minimum_feedback_count: number;
}

const formatRating = (rating: number | null) => (rating === null ? '-' : rating.toFixed(1));

const RatingStars = ({ rating }: { rating: number | null }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`h-4 w-4 ${rating !== null && star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
            />
        ))}
    </div>
);

const DistributionBars = ({ distribution, total }: { distribution: RatingDistribution; total: number }) => (
    <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution[rating as keyof RatingDistribution];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
                <div key={rating} className="grid grid-cols-[2rem_1fr_2.5rem] items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500">{rating}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-right font-semibold text-slate-500">{count}</span>
                </div>
            );
        })}
    </div>
);

export default function DepartmentRatingsPage({ departments, summary, minimum_feedback_count }: DepartmentRatingsPageProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    return (
        <PublicLayout title="Department Ratings" description="Public service ratings by department">
            <Head title="Department Ratings" />

            <main className="min-h-[calc(100vh-5rem)] bg-slate-50/60">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                    <Link
                        href={`/${slug}/home`}
                        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Bumalik sa Home
                    </Link>

                    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <p className="mt-5 text-xs font-bold tracking-widest text-primary uppercase">Service Transparency</p>
                                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Mga Rating ng Departamento</h1>
                                <p className="mt-3 text-sm leading-7 text-slate-600">
                                    Makikita rito ang pinagsama-samang rating ng bawat departamento. Hindi ipinapakita ang mensahe, pangalan ng
                                    empleyado, o personal na detalye ng nagsumite.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
                                <Card className="rounded-lg border-slate-200 shadow-none">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Overall</p>
                                        <p className="mt-2 text-2xl font-black text-slate-950">{formatRating(summary.average_rating)}</p>
                                    </CardContent>
                                </Card>
                                <Card className="rounded-lg border-slate-200 shadow-none">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Rated</p>
                                        <p className="mt-2 text-2xl font-black text-slate-950">{summary.rated_departments}</p>
                                    </CardContent>
                                </Card>
                                <Card className="rounded-lg border-slate-200 shadow-none">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Departments</p>
                                        <p className="mt-2 text-2xl font-black text-slate-950">{summary.active_departments}</p>
                                    </CardContent>
                                </Card>
                                <Card className="rounded-lg border-slate-200 shadow-none">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Feedback</p>
                                        <p className="mt-2 text-2xl font-black text-slate-950">{summary.total_public_feedback_count}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                        <p>
                            Public ratings appear only when a department has at least <b>{minimum_feedback_count}</b> rated feedback entries. This
                            avoids publishing unfair scores from very small samples.
                        </p>
                    </div>

                    {departments.length === 0 ? (
                        <Card className="mt-6 rounded-lg border-slate-200 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <MessageSquareHeart className="h-12 w-12 text-slate-300" />
                                <h2 className="mt-4 text-lg font-bold text-slate-950">Wala pang departamento</h2>
                                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Kapag may active departments at sapat na feedback, lalabas dito ang public service ratings.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <section className="mt-6 grid gap-4 lg:grid-cols-2">
                            {departments.map((department) => (
                                <Card key={department.id} className="rounded-lg border-slate-200 bg-white shadow-sm">
                                    <CardContent className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold tracking-widest text-primary uppercase">{department.code}</p>
                                                    <h2 className="mt-1 text-lg font-black text-slate-950">{department.name}</h2>
                                                    {department.description && (
                                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{department.description}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-3xl font-black text-slate-950">{formatRating(department.average_rating)}</p>
                                                <p className="text-xs font-semibold text-slate-500">/ 5</p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                            <div>
                                                <RatingStars rating={department.average_rating} />
                                                <p className="mt-1 text-xs font-bold text-slate-600">{department.rating_label}</p>
                                            </div>
                                            <div className="rounded-lg bg-slate-50 px-3 py-2 text-right">
                                                <p className="text-xs font-bold text-slate-500 uppercase">Feedback count</p>
                                                <p className="text-sm font-black text-slate-900">{department.feedback_count}</p>
                                            </div>
                                        </div>

                                        {department.is_public ? (
                                            <div className="mt-5">
                                                <DistributionBars distribution={department.distribution} total={department.feedback_count} />
                                            </div>
                                        ) : (
                                            <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                                                Kailangan pa ng mas maraming feedback bago ipakita ang public rating ng departamentong ito.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </PublicLayout>
    );
}
