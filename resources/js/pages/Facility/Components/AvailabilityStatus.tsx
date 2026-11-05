import { Availability, displayInstant } from '@/Core/Types/Facility/FacilityTypes';

export default function AvailabilityStatus({ availability, compact = false }: { availability: Availability; compact?: boolean }) {
    const held = ['delayed', 'temporarily_closed', 'permanently_closed'].includes(availability.status);
    return (
        <div className="space-y-2">
            <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${availability.is_open ? 'bg-emerald-50 text-emerald-800' : held || availability.status === 'cancelled' ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-700'}`}
            >
                {availability.label}
            </span>
            {availability.closes_at && <p className="text-sm text-slate-600">Closes {displayInstant(availability.closes_at)}</p>}
            {availability.is_open && !availability.closes_at && <p className="text-sm text-slate-600">Open 24 hours</p>}
            {availability.next_opens_at && <p className="text-sm text-slate-600">Opens {displayInstant(availability.next_opens_at)}</p>}
            {availability.is_open === false && !availability.next_opens_at && !held && (
                <p className="text-sm text-slate-600">No upcoming opening scheduled.</p>
            )}
            {availability.expected_reopens_at && (
                <p className="text-sm text-amber-900">
                    Expected reopening: {displayInstant(availability.expected_reopens_at)}. Awaiting confirmation.
                </p>
            )}
            {availability.notice && (
                <p className={`rounded-lg bg-amber-50 p-3 text-sm whitespace-pre-line text-amber-950 ${compact ? 'line-clamp-3' : ''}`}>
                    {availability.notice}
                </p>
            )}
        </div>
    );
}
