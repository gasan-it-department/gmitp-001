import { AlertCircle, Save } from 'lucide-react';
import { useState } from 'react';

export const EditAppointmentForm = ({ appointment }: { appointment: any }) => {
    // Assuming actual_start_date comes in as a full ISO or YYYY-MM-DD string
    const [startDate, setStartDate] = useState(appointment.actual_start_date?.substring(0, 10) || '');

    const handleSave = () => {
        // TODO: Call router.put() to UpdateAppointmentDetailsController
        console.log('Saving corrected date:', startDate);
    };

    return (
        <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-blue-500" />
                <p className="text-sm">
                    <strong>Correction Mode:</strong> Use this form only to fix data entry mistakes. If the official is leaving their position, use
                    the "End Service" tab instead.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Corrected Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm transition-all outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                    />
                </div>

                {/* Add Political Party or Status overrides here if your DB supports it */}
            </div>

            <div className="border-t border-slate-100 pt-4">
                <button
                    onClick={handleSave}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                >
                    <Save className="h-4 w-4" /> Save Corrections
                </button>
            </div>
        </div>
    );
};
