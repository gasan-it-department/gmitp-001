import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import { Link } from '@inertiajs/react'; // 👉 IMPORT ROUTER
import { useState } from 'react'; // 👉 IMPORT USEREF
import { OfficialHistoryTab } from './Components/OfficialHistoryTab';
import { OfficialProfilePictureDialog } from './Components/OfficialProfilePictureDialog';
import { OfficialProfileTab } from './Components/OfficialProfileTab';
interface Props {
    official: { data: Official };
    municipality: MunicipalityType;
}

export default function OfficialProfileDashboard({ official, municipality }: Props) {
    const officialData = official.data;
    const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
    // --- FORM STATE (Text Profile) ---

    const historyRecords = officialData.appointments || [];

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50 pb-12 dark:bg-zinc-950">
                {/* 1. BREADCRUMBS & HEADER BAR */}
                <div className="bg-white px-8 py-4 shadow-sm ring-1 ring-slate-200 dark:bg-zinc-900 dark:ring-zinc-800">
                    <div className="mx-auto max-w-5xl">
                        <nav className="flex text-sm font-medium text-slate-500 dark:text-zinc-400">
                            <Link href="/admin/officials" className="hover:text-slate-900 dark:hover:text-white">
                                Directory
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-slate-900 dark:text-gray-200">{officialData.formatted_name}</span>
                        </nav>
                    </div>
                </div>

                <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* 2. THE IDENTITY HEADER */}
                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-6">
                            {/* 👉 DROP THE COMPONENT HERE */}
                            <OfficialProfilePictureDialog officialId={officialData.id} currentImageUrl={officialData.profile_url} />

                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{officialData.formatted_name}</h1>
                                <div className="mt-2 flex items-center gap-3">
                                    {officialData.active_appointments_exists ? (
                                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                            Active Official
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-500/10 ring-inset dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700">
                                            Historical Record
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. THE TABS NAVIGATION */}
                    <div className="mt-8 border-b border-slate-200 dark:border-zinc-800">
                        {/* ... your existing tab navigation logic ... */}
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeTab === 'profile'
                                        ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Profile Details
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeTab === 'history'
                                        ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-gray-300'
                                }`}
                            >
                                Term & Appointment History
                                <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-900 dark:bg-zinc-800 dark:text-white">
                                    {officialData.appointments_count}
                                </span>
                            </button>
                        </nav>
                    </div>
                    {/* 4. TAB CONTENTS */}
                    <div className="mt-8">
                        {/* --- TAB: PROFILE DETAILS --- */}
                        {activeTab === 'profile' && <OfficialProfileTab official={officialData} />}

                        {/* --- TAB: TERM HISTORY --- */}
                        {activeTab === 'history' && (
                            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-zinc-900 dark:ring-zinc-800">
                                <div className="border-b border-slate-200 p-8 sm:flex sm:items-center sm:justify-between dark:border-zinc-800">
                                    <div>
                                        <h2 className="text-base leading-7 font-semibold text-slate-900 dark:text-white">Appointment Records</h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-zinc-400">
                                            Chronological history of seats and positions held.
                                        </p>
                                    </div>
                                    <div className="mt-4 sm:mt-0 sm:ml-4"></div>
                                </div>

                                <div className="p-8">
                                    {historyRecords.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                                                No appointment records found for this official.
                                            </p>
                                        </div>
                                    ) : (
                                        <OfficialHistoryTab official={officialData} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
