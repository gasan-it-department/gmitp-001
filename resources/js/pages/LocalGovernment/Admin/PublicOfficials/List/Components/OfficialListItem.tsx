import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { profile } from '@/routes/government/admin/officials';
import { Link } from '@inertiajs/react';

// ==========================================
// 1. EXTRACTED COMPONENT: The List Item
// This isolates the complex HTML and conditionals
// ==========================================
export function OfficialListItem({ official }: { official: Official }) {
    const { currentMunicipality } = useMunicipality();
    return (
        <li className="relative flex items-center justify-between gap-x-6 px-4 py-5 transition-colors hover:bg-slate-50 sm:px-6 dark:hover:bg-zinc-800/50">
            {/* Left Side: Avatar and Identity */}
            <div className="flex min-w-0 gap-x-4">
                <img
                    className="h-12 w-12 flex-none rounded-full bg-slate-100 object-cover ring-1 ring-slate-200 dark:bg-zinc-800 dark:ring-zinc-700"
                    src={official.profile_url || '/images/placeholder_avatar.png'}
                    alt={official.formatted_name}
                />
                <div className="min-w-0 flex-auto">
                    <p className="text-sm leading-6 font-bold text-slate-900 dark:text-white">{official.formatted_name}</p>
                </div>
            </div>

            {/* Right Side: Status and Actions */}
            <div className="flex shrink-0 items-center gap-x-6">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm leading-6 text-slate-900 dark:text-gray-200">{official.appointments_count} Term(s) Recorded</p>
                    {official.active_appointments_exists ? (
                        <div className="mt-1 flex items-center gap-x-1.5">
                            <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-xs leading-5 font-semibold text-emerald-600 dark:text-emerald-400">Active Now</p>
                        </div>
                    ) : (
                        <div className="mt-1 flex items-center gap-x-1.5">
                            <div className="flex-none rounded-full bg-slate-500/20 p-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            </div>
                            <p className="text-xs leading-5 font-medium text-slate-500 dark:text-zinc-400">Historical</p>
                        </div>
                    )}
                </div>

                <Link
                    href={profile({
                        municipality: currentMunicipality.slug,
                        officialId: official.id,
                    })} // Dynamic routing!
                    className="hidden rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-300 transition-colors ring-inset hover:bg-slate-50 sm:block dark:bg-zinc-800 dark:text-white dark:ring-zinc-600 dark:hover:bg-zinc-700"
                >
                    Edit Profile
                </Link>

                <svg className="h-5 w-5 flex-none text-slate-400 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </li>
    );
}
