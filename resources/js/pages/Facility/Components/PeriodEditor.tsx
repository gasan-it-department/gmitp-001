import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { defaultPeriod, inputTime, parseTime, Period } from '@/Core/Types/Facility/FacilityTypes';

export default function PeriodEditor({ periods, onChange, label }: { periods: Period[]; onChange: (periods: Period[]) => void; label: string }) {
    const update = (index: number, field: keyof Period, value: number) =>
        onChange(periods.map((period, i) => (i === index ? { ...period, [field]: value } : period)));
    return (
        <div className="space-y-3">
            {periods.map((period, index) => (
                <div key={index} className="flex flex-wrap items-end gap-3">
                    <label className="space-y-1 text-sm">
                        <span className="block">Opening</span>
                        <Input
                            aria-label={`${label}, period ${index + 1}, opening`}
                            type="time"
                            required
                            value={inputTime(period.opening_minute)}
                            onChange={(e) => e.target.value && update(index, 'opening_minute', parseTime(e.target.value))}
                        />
                    </label>
                    <label className="space-y-1 text-sm">
                        <span className="block">Closing</span>
                        <Input
                            aria-label={`${label}, period ${index + 1}, closing`}
                            type="time"
                            required
                            value={inputTime(period.closing_minute)}
                            onChange={(e) => e.target.value && update(index, 'closing_minute', parseTime(e.target.value) || 1440)}
                        />
                    </label>
                    <span className="pb-2 text-xs text-slate-500">{period.closing_minute === 1440 ? 'Closes at end of day' : ''}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onChange(periods.filter((_, i) => i !== index))}
                        aria-label={`Remove ${label} period ${index + 1}`}
                    >
                        Remove
                    </Button>
                </div>
            ))}
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={periods.length >= 12}
                    onClick={() => {
                        const end = periods.at(-1)?.closing_minute;
                        onChange([
                            ...periods,
                            end !== undefined && end < 1440 ? { opening_minute: end, closing_minute: Math.min(end + 60, 1440) } : defaultPeriod(),
                        ]);
                    }}
                >
                    Add period
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onChange([{ opening_minute: 0, closing_minute: 1440 }])}>
                    Open 24 hours
                </Button>
            </div>
        </div>
    );
}
