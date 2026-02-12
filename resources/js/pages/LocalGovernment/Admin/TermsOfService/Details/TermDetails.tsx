import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import government from '@/routes/government';
import { Link } from '@inertiajs/react';
import { Building2, Calendar, CheckCircle2, History, UserPlus } from 'lucide-react';

interface Props {
    term: { data: Term };
    positions: Position[];
    municipality: MunicipalityType;
}

export default function TermDetails({ term, positions, municipality }: Props) {
    const termDetails = term.data;

    // Helper for formatting dates nicely (e.g., "June 30, 2026")
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <div className="max-w-8xl m-10 space-y-8 py-6">
                {/* --- 1. HEADER SECTION --- */}
                <div className="flex flex-col items-start justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
                    <div className="space-y-1">
                        {/* Context Label */}
                        <div className="flex items-center text-sm font-medium tracking-wide text-gray-500 uppercase">
                            <Building2 className="mr-2 h-4 w-4" />
                            {municipality.name}
                        </div>

                        {/* Main Title & Badge */}
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{termDetails.name}</h1>
                            {termDetails.is_current ? (
                                <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Active Term
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                    <History className="mr-1 h-3 w-3" />
                                    Past Term
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Primary Action Button (Ready for your next step) */}
                    <Link
                        href={government.admin.officials.terms.page.url({ municipality: municipality.slug, termId: termDetails.id })}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Appoint Official
                    </Link>
                </div>

                {/* --- 2. DETAILS GRID --- */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Start Date Card */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-500">Statutory Start</h3>
                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatDate(termDetails.statutory_start)}</p>
                        <p className="mt-1 text-xs text-gray-500">Official assumption of office</p>
                    </div>

                    {/* End Date Card */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-500">Statutory End</h3>
                            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatDate(termDetails.statutory_end)}</p>
                        <p className="mt-1 text-xs text-gray-500">End of legal mandate</p>
                    </div>

                    {/* Stats Card (Example: Vacancy Count) */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-500">Total Positions</h3>
                            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                                <UserPlus className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{positions.length}</p>
                        <p className="mt-1 text-xs text-gray-500">Available seats in this term</p>
                    </div>
                </div>

                {/* --- 3. ROSTER SECTION (Placeholder) --- */}
                <div className="flex min-h-[400px] items-center justify-center rounded-xl border bg-white text-gray-400 shadow-sm">
                    <div className="text-center">
                        <p>The roster of officials will appear here.</p>
                        <p className="mt-2 text-sm">Click "Appoint Official" to start.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
