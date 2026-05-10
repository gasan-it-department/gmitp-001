import { AssistanceTypeListItem } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import ToastProvider from '@/pages/Utility/ToastShower';
import actionCenter from '@/routes/actionCenter';
import { Link, usePage } from '@inertiajs/react';
import { Banknote, CalendarClock, CheckCircle2, Edit2, FileText, Plus, XCircle } from 'lucide-react';

interface Props {
    assistanceTypeList: { data: AssistanceTypeListItem[] };
}

export default function AssistanceTypeList({ assistanceTypeList }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const assistanceTypes = assistanceTypeList.data;
    return (
        <AppLayout>
            <ToastProvider position="top-right" />

            <div className="min-h-screen px-6 py-8">
                {/* --- HEADER --- */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Assistance Types</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Configure the aid categories and rules available in {currentMunicipality?.name ?? 'your municipality'}.
                        </p>
                    </div>

                    <Link
                        // href={actionCenter.admin.create.assistance.type.url({ municipality: currentMunicipality.slug })}
                        href={actionCenter.admin.create.assistance.type.url({ municipality: currentMunicipality.slug })}
                        className="group inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 hover:shadow"
                    >
                        <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                        Create Assistance
                    </Link>
                </div>

                {/* --- CARD GRID --- */}
                {assistanceTypes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
                        <FileText className="mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900">No Assistance Types Configured</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first MSWD aid category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {assistanceTypes.map((type) => (
                            <div
                                key={type.id}
                                className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                            >
                                {/* Card Header */}
                                <div className="mb-4 flex items-start justify-between">
                                    <h3 className="line-clamp-1 pr-4 text-lg font-bold text-gray-900" title={type.name}>
                                        {type.name}
                                    </h3>

                                    {/* Status Badge */}
                                    {type.is_active ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/20 ring-inset">
                                            <XCircle className="h-3.5 w-3.5" />
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                {/* Card Body (Description) */}
                                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                                    {type.description || <span className="text-gray-400 italic">No description provided.</span>}
                                </p>

                                {/* NEW: Business Rules Badges */}
                                <div className="mt-auto mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
                                    {type.max_amount > 0 && (
                                        <span className="flex items-center gap-1.5 rounded-md border border-gray-100 bg-gray-50 px-2 py-1.5">
                                            <Banknote className="h-3.5 w-3.5 text-green-600" />
                                            Up to ₱{type.max_amount.toLocaleString()}
                                        </span>
                                    )}
                                    {type.cooldown_months > 0 && (
                                        <span className="flex items-center gap-1.5 rounded-md border border-gray-100 bg-gray-50 px-2 py-1.5">
                                            <CalendarClock className="h-3.5 w-3.5 text-blue-600" />
                                            {type.cooldown_months} Month Cooldown
                                        </span>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <FileText className="h-4 w-4 text-orange-400" />
                                        {type.requirements_count} Requirements
                                    </div>

                                    <Link
                                        href={actionCenter.admin.edit.assistanceType.url({ municipality: currentMunicipality.slug, id: type.id })}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
                                    >
                                        Edit <Edit2 className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
