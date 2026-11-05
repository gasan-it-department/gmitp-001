import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminFacility, defaultPeriod, Option } from '@/Core/Types/Facility/FacilityTypes';
import { useForm } from '@inertiajs/react';
import FormErrors from '../../Components/FormErrors';
import PeriodEditor from '../../Components/PeriodEditor';

export default function OperatingStatusForm({
    facility,
    slug,
    statuses,
    editable,
}: {
    facility: AdminFacility;
    slug: string;
    statuses: Option[];
    editable: boolean;
}) {
    const form = useForm({
        operating_status: facility.operating_status,
        operating_notice: facility.operating_notice ?? '',
        expected_reopens_at: facility.expected_reopens_at_input ?? '',
        revise_today: false as boolean,
        resume_notice: '',
        periods: [defaultPeriod()],
    });
    const resuming = form.data.operating_status === 'following_schedule';
    return (
        <section className="rounded-xl border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Operating status</h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">
                Use an ongoing hold when reopening is uncertain. An estimated time never automatically resumes operation.
            </p>
            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.transform((data) => ({
                        revision: facility.revision,
                        operating_status: data.operating_status,
                        operating_notice: resuming ? null : data.operating_notice,
                        expected_reopens_at: resuming || data.operating_status === 'permanently_closed' ? null : data.expected_reopens_at || null,
                        today_exception:
                            resuming && data.revise_today
                                ? {
                                      exception_date: facility.availability.date,
                                      is_closed: false,
                                      notice_type: 'special_hours',
                                      public_notice: data.resume_notice,
                                      periods: data.periods,
                                  }
                                : null,
                    }));
                    form.patch(`/api/facility/${facility.id}/operating-status`, {
                        headers: { 'X-Municipality-Slug': slug },
                        preserveScroll: true,
                        onSuccess: () => form.setData('revise_today', false),
                    });
                }}
            >
                <fieldset disabled={!editable || form.processing} className="space-y-4">
                    <label className="block space-y-1 text-sm">
                        <span>Status</span>
                        <select
                            className="h-10 w-full rounded border bg-white px-3"
                            value={form.data.operating_status}
                            onChange={(e) => form.setData('operating_status', e.target.value)}
                        >
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    {!resuming && (
                        <>
                            <label className="block space-y-1 text-sm">
                                <span>Public notice *</span>
                                <Textarea
                                    required
                                    maxLength={2000}
                                    rows={3}
                                    value={form.data.operating_notice}
                                    onChange={(e) => form.setData('operating_notice', e.target.value)}
                                />
                            </label>
                            {form.data.operating_status !== 'permanently_closed' && (
                                <label className="block space-y-1 text-sm">
                                    <span>Expected reopening (optional, Asia/Manila)</span>
                                    <Input
                                        type="datetime-local"
                                        value={form.data.expected_reopens_at}
                                        onChange={(e) => form.setData('expected_reopens_at', e.target.value)}
                                    />
                                    <span className="text-xs text-slate-500">An estimate only. Clear the hold manually when operation resumes.</span>
                                </label>
                            )}
                        </>
                    )}
                    {resuming && facility.operating_status !== 'following_schedule' && (
                        <>
                            <p className="text-sm text-slate-600">
                                Resume using today's effective hours, or replace them below. Resuming outside opening hours will still show Closed
                                now.
                            </p>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.revise_today}
                                    onChange={(e) => form.setData('revise_today', e.target.checked)}
                                />
                                Save revised hours for today while resuming
                            </label>
                            {form.data.revise_today && (
                                <div className="space-y-4 rounded-lg border p-4">
                                    <PeriodEditor
                                        label="Revised hours today"
                                        periods={form.data.periods}
                                        onChange={(periods) => form.setData('periods', periods)}
                                    />
                                    <label className="block space-y-1 text-sm">
                                        <span>Public explanation *</span>
                                        <Textarea
                                            required
                                            value={form.data.resume_notice}
                                            onChange={(e) => form.setData('resume_notice', e.target.value)}
                                        />
                                    </label>
                                    <p className="text-xs text-slate-500">Replaces any existing schedule update for today in the same save.</p>
                                </div>
                            )}
                        </>
                    )}
                </fieldset>
                <FormErrors errors={form.errors} />
                {editable && (
                    <Button disabled={form.processing}>
                        {form.processing
                            ? 'Saving…'
                            : resuming && facility.operating_status !== 'following_schedule'
                              ? 'Resume schedule'
                              : 'Save operating status'}
                    </Button>
                )}
            </form>
        </section>
    );
}
