import { Button } from '@/components/ui/button';
import { AdminFacility, dayNames, defaultPeriod, WeeklyDay } from '@/Core/Types/Facility/FacilityTypes';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import FormErrors from '../../Components/FormErrors';
import PeriodEditor from '../../Components/PeriodEditor';

export default function WeeklyHoursForm({ facility, slug, editable }: { facility: AdminFacility; slug: string; editable: boolean }) {
    const form = useForm({
        days: dayNames.map(
            (_, i) => facility.weekly_days.find((day) => day.day_of_week === i + 1) ?? { day_of_week: i + 1, is_closed: true, periods: [] },
        ),
    });
    const [source, setSource] = useState(1);
    const [targets, setTargets] = useState<number[]>([2, 3, 4, 5]);
    const update = (index: number, patch: Partial<WeeklyDay>) =>
        form.setData(
            'days',
            form.data.days.map((day, i) => (i === index ? { ...day, ...patch } : day)),
        );
    return (
        <section className="rounded-xl border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Weekly hours</h2>
            <p className="mt-1 text-sm text-slate-500">Repeats every week. All times are Asia/Manila. Midnight closing means the end of that day.</p>
            {!facility.weekly_days.length && (
                <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                    Hours are not configured yet. Review all seven days, then save before publishing.
                </p>
            )}
            <form
                className="mt-5 space-y-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.transform((data) => ({ ...data, revision: facility.revision }));
                    form.put(`/api/facility/${facility.id}/weekly-hours`, { headers: { 'X-Municipality-Slug': slug }, preserveScroll: true });
                }}
            >
                <fieldset disabled={!editable || form.processing} className="space-y-5">
                    <details className="rounded-lg border p-3">
                        <summary className="cursor-pointer text-sm font-medium">Copy hours to other days</summary>
                        <div className="mt-3 space-y-3">
                            <label className="text-sm">
                                Copy from{' '}
                                <select className="ml-2 rounded border p-1" value={source} onChange={(e) => setSource(Number(e.target.value))}>
                                    {dayNames.map((day, i) => (
                                        <option key={day} value={i + 1}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {dayNames.map((day, i) => (
                                    <label key={day} className="flex items-center gap-1 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={targets.includes(i + 1)}
                                            onChange={(e) =>
                                                setTargets(e.target.checked ? [...targets, i + 1] : targets.filter((value) => value !== i + 1))
                                            }
                                        />
                                        {day.slice(0, 3)}
                                    </label>
                                ))}
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const original = form.data.days[source - 1];
                                    form.setData(
                                        'days',
                                        form.data.days.map((day) =>
                                            targets.includes(day.day_of_week)
                                                ? {
                                                      ...day,
                                                      is_closed: original.is_closed,
                                                      periods: original.periods.map((period) => ({ ...period })),
                                                  }
                                                : day,
                                        ),
                                    );
                                }}
                            >
                                Copy selected hours
                            </Button>
                        </div>
                    </details>
                    {form.data.days.map((day, index) => (
                        <div key={day.day_of_week} className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-medium">{dayNames[index]}</h3>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={day.is_closed}
                                        onChange={(e) =>
                                            update(index, { is_closed: e.target.checked, periods: e.target.checked ? [] : [defaultPeriod()] })
                                        }
                                    />
                                    Closed all day
                                </label>
                            </div>
                            {!day.is_closed && (
                                <PeriodEditor label={dayNames[index]} periods={day.periods} onChange={(periods) => update(index, { periods })} />
                            )}
                        </div>
                    ))}
                </fieldset>
                <FormErrors errors={form.errors} />
                {editable && <Button disabled={form.processing}>{form.processing ? 'Saving…' : 'Save weekly hours'}</Button>}
            </form>
        </section>
    );
}
