import { Calendar, CheckCircle2, Clock, ShieldAlert, User } from 'lucide-react';
import { useState } from 'react';
import { EditHistoryDialog } from './EditHistoryDialog';
import { HistoryTimelineItem } from './HistoryTimelineItem';

interface Props {
    appointment: OfficialTerm; // Kept 'any' or 'OfficialTerm' based on your types
    history: OfficialTerm[];
}

export const AppointmentOverview = ({ appointment, history }: Props) => {
    const official = appointment.official;
    const isActive = !appointment.actual_end_date;
    const [editingRecord, setEditingRecord] = useState<OfficialTerm | null>(null);

    return (
        <div className="relative space-y-8 duration-300 animate-in fade-in">
            {/* Identity Header */}
            <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-slate-50 bg-blue-100 shadow-sm">
                    {official?.profile_url ? (
                        <img src={official.profile_url} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <User className="h-8 w-8 text-blue-600" />
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900">{official?.formatted_name ?? 'Vacant Position'}</h2>
                    <div className="mt-1 flex items-center gap-2">
                        {isActive ? (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Active in Position
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                                <ShieldAlert className="h-3.5 w-3.5" /> Service Concluded
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-500 uppercase">
                        <Calendar className="h-4 w-4" /> Start Date
                    </div>
                    <div className="mt-2 text-lg font-bold text-slate-900">
                        {appointment.actual_start_date ? new Date(appointment.actual_start_date).toLocaleDateString() : 'Not Set'}
                    </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-500 uppercase">
                        <Calendar className="h-4 w-4" /> End Date
                    </div>
                    <div className="mt-2 text-lg font-bold text-slate-900">
                        {appointment.actual_end_date ? new Date(appointment.actual_end_date).toLocaleDateString() : 'Present'}
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                <p>
                    <strong>Record ID:</strong> <span className="font-mono">{appointment.id}</span>
                </p>
                <p>This record acts as the official history for this specific seat during this term.</p>
            </div>

            {/* --- The Succession Timeline --- */}
            <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-6 flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 uppercase">
                    <Clock className="h-4 w-4" /> Seat History
                </h3>

                {/* Timeline Container */}
                <div className="relative ml-3 space-y-6 border-l-2 border-slate-200 pb-4">
                    {/* Item 1: The Current Record (Visual Anchor) */}
                    <div className="relative pl-6">
                        <div className="absolute top-1.5 -left-[7px] h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white" />
                        <h4 className="text-sm font-bold text-slate-900">{official?.formatted_name ?? 'Vacant'}</h4>
                        <p className="mt-0.5 text-xs font-bold tracking-wider text-blue-600 uppercase">Current Status</p>
                    </div>

                    {/* Items 2+: The Predecessors rendered via Child Component */}
                    {history.length > 0 ? (
                        history.map((historyRecord) => (
                            <HistoryTimelineItem key={historyRecord.id} onEdit={setEditingRecord} record={historyRecord} />
                        ))
                    ) : (
                        <div className="relative pt-4 pl-6 text-xs text-slate-400 italic">No previous officials recorded for this term.</div>
                    )}
                    <EditHistoryDialog isOpen={!!editingRecord} record={editingRecord} onClose={() => setEditingRecord(null)} />
                </div>
            </div>
        </div>
    );
};
