// 1. Extend your base Official interface specifically for this dashboard view
// This matches your Laravel OfficialResource EXACTLY.
interface OfficialDashboard extends Official {
    appointments: Appointment[];
}

// 2. The component only takes ONE prop now
interface Props {
    official: OfficialDashboard;
}

export const OfficialHistoryTab = ({ official }: Props) => {
    // 3. Extract the history safely inside the component
    const history = official.appointments || [];
    if (history.length === 0) {
        return <div className="py-12 text-center text-sm text-slate-500 dark:text-zinc-400">No appointment records found for this official.</div>;
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {history.map((record, recordIdx) => {
                    // Logic to determine if THIS SPECIFIC term is active
                    const isCurrentlySitting = record.actual_end_date === null;

                    return (
                        <li key={record.id}>
                            <div className="relative pb-8">
                                {recordIdx !== history.length - 1 && (
                                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200 dark:bg-zinc-800" aria-hidden="true" />
                                )}

                                <div className="relative flex items-start space-x-3">
                                    <div className="relative">
                                        <span
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white dark:ring-zinc-900 ${
                                                isCurrentlySitting ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-zinc-600'
                                            }`}
                                        >
                                            <svg
                                                className="h-5 w-5 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                                                />
                                            </svg>
                                        </span>
                                    </div>

                                    <div className="min-w-0 flex-1 py-1.5">
                                        <div className="text-sm text-slate-500 dark:text-zinc-400">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <span className="text-base font-medium text-slate-900 dark:text-white">
                                                    {record.position?.title || 'Unknown Position'}
                                                </span>
                                                <span className="mt-1 text-sm font-semibold whitespace-nowrap text-slate-900 sm:mt-0 dark:text-gray-300">
                                                    Term: {record.term.label || 'UnDknown Term'}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs">Assumed Office: {record.actual_start_date}</span>

                                                {isCurrentlySitting ? (
                                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                                        Currently Sitting
                                                    </span>
                                                ) : (
                                                    <span className="text-xs">Ended: {record.actual_end_date}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
