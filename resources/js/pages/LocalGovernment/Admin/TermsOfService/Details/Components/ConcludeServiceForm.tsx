import { PowerOff, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

export const ConcludeServiceForm = ({ appointment }: { appointment: any }) => {
    const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
    const [reason, setReason] = useState('resigned');

    const handleConclude = () => {
        // TODO: Call router.put() to ConcludeOfficialTermController
        console.log('Concluding service:', { endDate, reason });
    };

    return (
        <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-sm">
                    <p className="font-bold text-amber-800">You are about to end this official's active service.</p>
                    <p className="mt-1">
                        This will vacate the position on the public roster and preserve this appointment in the historical records.
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Effective End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm transition-all outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Reason for Leaving</label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm transition-all outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                    >
                        <option value="resigned">Resigned</option>
                        <option value="promoted">Promoted / Transferred</option>
                        <option value="deceased">Deceased</option>
                        <option value="removed">Removed from Office</option>
                    </select>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
                <button
                    onClick={handleConclude}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg active:scale-[0.98]"
                >
                    <PowerOff className="h-4 w-4" /> Finalize & End Service
                </button>
            </div>
        </div>
    );
};
