import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminFacility, defaultPeriod, displayDate, displayPeriods, Option, ScheduleException } from '@/Core/Types/Facility/FacilityTypes';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import FormErrors from '../../Components/FormErrors';
import PeriodEditor from '../../Components/PeriodEditor';
import FacilityNotificationControl, { notificationHours, NotificationOptions } from './FacilityNotificationControl';

function ExceptionEditor({
    facility,
    slug,
    types,
    notificationOptions,
    municipalityName,
    exception,
    cancel,
}: {
    facility: AdminFacility;
    slug: string;
    types: Option[];
    notificationOptions: NotificationOptions;
    municipalityName: string;
    exception: ScheduleException | null;
    cancel: () => void;
}) {
    const form = useForm({
        exception_date: exception?.exception_date ?? facility.availability.date,
        end_date: '',
        notice_type: exception?.notice_type ?? 'closed',
        is_closed: exception?.is_closed ?? true,
        public_notice: exception?.public_notice ?? '',
        periods: exception?.periods ?? [],
        notify_mobile: false as boolean,
    });
    const notify = form.data.notify_mobile && facility.is_published && notificationOptions.available;
    const labels: Record<string, string> = { cancelled: 'Cancelled', closed: 'Closed', special_hours: 'Special hours', delayed: 'Delayed opening' };
    const end = form.data.end_date || form.data.exception_date;
    const dates = end === form.data.exception_date ? `Date: ${form.data.exception_date}` : `Dates: ${form.data.exception_date} to ${end}`;
    const message = `${dates}. ${form.data.public_notice.trim()}${form.data.is_closed ? '' : ` Hours: ${notificationHours(form.data.periods)} (Philippine time).`}`;
    return (
        <form
            className="space-y-4 rounded-lg border bg-slate-50 p-4"
            onSubmit={(e) => {
                e.preventDefault();
                form.transform((data) => ({ ...data, notify_mobile: notify, revision: facility.revision }));
                const options = {
                    headers: { 'X-Municipality-Slug': slug },
                    preserveScroll: true,
                    onSuccess: () => {
                        form.reset();
                        cancel();
                    },
                };
                if (exception) form.put(`/api/facility/${facility.id}/exceptions/${exception.id}`, options);
                else form.post(`/api/facility/${facility.id}/exceptions`, options);
            }}
        >
            <h3 className="font-medium">{exception ? 'Edit schedule update' : 'Add schedule update'}</h3>
            <fieldset disabled={form.processing} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm">
                        <span className="block">Date *</span>
                        <Input
                            type="date"
                            required
                            value={form.data.exception_date}
                            onChange={(e) => form.setData('exception_date', e.target.value)}
                        />
                    </label>
                    {!exception && (
                        <label className="space-y-1 text-sm">
                            <span className="block">Through date (optional)</span>
                            <Input
                                type="date"
                                min={form.data.exception_date}
                                value={form.data.end_date}
                                onChange={(e) => form.setData('end_date', e.target.value)}
                            />
                        </label>
                    )}
                </div>
                <label className="block space-y-1 text-sm">
                    <span>Update type *</span>
                    <select
                        className="h-10 w-full rounded border bg-white px-3"
                        value={form.data.notice_type}
                        onChange={(e) => {
                            const closed = ['closed', 'cancelled'].includes(e.target.value);
                            form.setData({
                                ...form.data,
                                notice_type: e.target.value,
                                is_closed: closed,
                                periods: closed ? [] : form.data.periods.length ? form.data.periods : [defaultPeriod()],
                            });
                        }}
                    >
                        {types.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </label>
                {!form.data.is_closed && (
                    <PeriodEditor label="Special hours" periods={form.data.periods} onChange={(periods) => form.setData('periods', periods)} />
                )}
                {form.data.notice_type === 'delayed' && (
                    <p className="text-sm text-slate-600">
                        Enter confirmed revised hours. If reopening is uncertain, use the operating status section instead.
                    </p>
                )}
                <label className="block space-y-1 text-sm">
                    <span>Public explanation *</span>
                    <Textarea
                        required
                        maxLength={2000}
                        rows={3}
                        value={form.data.public_notice}
                        onChange={(e) => form.setData('public_notice', e.target.value)}
                        placeholder="Explain the change to residents."
                    />
                </label>
                <p className="text-xs text-slate-500">
                    Replaces the entire schedule for each selected date. Existing updates are never silently overwritten. Maximum 366 dates.
                </p>
                {facility.operating_status !== 'following_schedule' && (
                    <p className="text-sm text-amber-900">
                        This facility has an active hold. Revised hours do not clear it; use Resume schedule when ready.
                    </p>
                )}
                <FacilityNotificationControl
                    options={notificationOptions}
                    published={facility.is_published}
                    checked={form.data.notify_mobile}
                    onChange={(checked) => form.setData('notify_mobile', checked)}
                    title={`${municipalityName} - ${facility.name}: ${labels[form.data.notice_type]}`}
                    message={message}
                />
            </fieldset>
            <FormErrors errors={form.errors} />
            <div className="flex gap-2">
                <Button disabled={form.processing}>
                    {form.processing
                        ? 'Saving…'
                        : notify
                          ? notificationOptions.schema === 'test'
                              ? 'Save and send test'
                              : 'Save and notify'
                          : 'Save schedule update'}
                </Button>
                {exception && (
                    <Button type="button" variant="outline" onClick={cancel}>
                        Cancel edit
                    </Button>
                )}
            </div>
        </form>
    );
}

export default function ExceptionsForm({
    facility,
    slug,
    types,
    notificationOptions,
    municipalityName,
    editable,
}: {
    facility: AdminFacility;
    slug: string;
    types: Option[];
    notificationOptions: NotificationOptions;
    municipalityName: string;
    editable: boolean;
}) {
    const [editing, setEditing] = useState<ScheduleException | null>(null);
    const deletion = useForm({});
    return (
        <section className="rounded-xl border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Date-specific updates</h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">
                Holiday hours, confirmed delays and cancellations. Weekly hours resume after the affected date.
            </p>
            {editable && (
                <ExceptionEditor
                    key={editing?.id ?? 'new'}
                    facility={facility}
                    slug={slug}
                    types={types}
                    notificationOptions={notificationOptions}
                    municipalityName={municipalityName}
                    exception={editing}
                    cancel={() => setEditing(null)}
                />
            )}
            <FormErrors errors={deletion.errors} />
            <div className="mt-5 space-y-3">
                {facility.exceptions.length ? (
                    [...facility.exceptions]
                        .sort((a, b) => b.exception_date.localeCompare(a.exception_date))
                        .map((exception) => (
                            <article key={exception.id} className="rounded-lg border p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-medium">{displayDate(exception.exception_date)}</h3>
                                        <p className="text-sm text-slate-600">
                                            {types.find((type) => type.value === exception.notice_type)?.label} ·{' '}
                                            {exception.is_closed ? 'Closed all day' : displayPeriods(exception.periods)}
                                        </p>
                                    </div>
                                    {editable && (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setEditing(exception)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={deletion.processing}
                                                onClick={() => {
                                                    if (!window.confirm('Remove this update? The regular weekly schedule will apply to this date.'))
                                                        return;
                                                    deletion.transform(() => ({ revision: facility.revision }));
                                                    deletion.delete(`/api/facility/${facility.id}/exceptions/${exception.id}`, {
                                                        headers: { 'X-Municipality-Slug': slug },
                                                        preserveScroll: true,
                                                        onSuccess: () => setEditing(null),
                                                    });
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-sm whitespace-pre-line">{exception.public_notice}</p>
                            </article>
                        ))
                ) : (
                    <p className="text-sm text-slate-500">No date-specific updates.</p>
                )}
            </div>
        </section>
    );
}
