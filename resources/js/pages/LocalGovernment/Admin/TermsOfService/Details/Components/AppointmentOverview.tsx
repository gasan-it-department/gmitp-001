import { Calendar, CheckCircle2, ShieldAlert, User } from 'lucide-react';

interface Props {
    appointment: OfficialTerm;
}

export const AppointmentOverview = ({ appointment }: Props) => {
    const official = appointment.official;
    const isActive = !appointment.actual_end_date;

    return (
        <div className="space-y-8 duration-300 animate-in fade-in">
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
                    <h2 className="text-2xl font-black text-slate-900">{official?.formatted_name}</h2>
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
        </div>
    );
};
