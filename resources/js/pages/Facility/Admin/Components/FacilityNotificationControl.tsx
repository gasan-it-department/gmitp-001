import { Period } from '@/Core/Types/Facility/FacilityTypes';

export type NotificationOptions = { available: boolean; schema: 'test' | 'app_main_schema' };

export function notificationHours(periods: Period[]): string {
    const time = (minute: number) =>
        `${Math.floor(minute / 60)
            .toString()
            .padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`;
    return [...periods]
        .sort((a, b) => a.opening_minute - b.opening_minute)
        .map((period) => `${time(period.opening_minute)}-${time(period.closing_minute)}`)
        .join(', ');
}

export default function FacilityNotificationControl({
    options,
    published,
    checked,
    onChange,
    title,
    message,
}: {
    options: NotificationOptions;
    published: boolean;
    checked: boolean;
    onChange: (checked: boolean) => void;
    title: string;
    message: string;
}) {
    const enabled = published && options.available;
    const test = options.schema === 'test';
    return (
        <div className="space-y-3 rounded-lg border bg-white p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" disabled={!enabled} checked={enabled && checked} onChange={(event) => onChange(event.target.checked)} />
                {test ? 'Send test notification' : 'Notify AGA Mobile users'}
            </label>
            <p className="text-xs text-slate-500">
                {!published
                    ? 'Publish this facility before sending notifications.'
                    : !options.available
                      ? 'Mobile notifications are unavailable. The facility update can still be saved.'
                      : test
                        ? 'Sends to all registered AGA test devices after saving a change.'
                        : 'Sends to all registered AGA users, including users from other municipalities, after saving a change.'}
            </p>
            {enabled && checked && (
                <div className="space-y-1 rounded border bg-slate-50 p-3 text-sm" aria-live="polite">
                    <p className="text-xs text-slate-500">Notification preview</p>
                    <p className="font-medium">{title}</p>
                    <p className="whitespace-pre-line">{message}</p>
                </div>
            )}
        </div>
    );
}
