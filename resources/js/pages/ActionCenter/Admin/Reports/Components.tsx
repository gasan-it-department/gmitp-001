import AssistanceRequestReportController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Report/AssistanceRequestReportController';
import BeneficiaryRegistryReportController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Report/BeneficiaryRegistryReportController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { Link } from '@inertiajs/react';
import { Download, FileBarChart, Filter, RotateCcw, Users } from 'lucide-react';
import { ReactNode } from 'react';

export const ALL_OPTION = '__all__';

export function ReportsHeader({ exportUrl }: { exportUrl: string }) {
    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Action Center</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950">Reports</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                    Review filtered operational records before exporting the same result set to Excel.
                </p>
            </div>
            <a href={exportUrl} className="w-full sm:w-auto">
                <Button className="h-10 w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto">
                    <Download className="h-4 w-4" /> Export Excel
                </Button>
            </a>
        </header>
    );
}

export function ReportsTabs({ active }: { active: 'assistance' | 'beneficiaries' }) {
    const { currentMunicipality } = useMunicipality();

    const tabs = [
        {
            key: 'assistance' as const,
            label: 'Assistance Requests',
            icon: FileBarChart,
            href: AssistanceRequestReportController.url({ municipality: currentMunicipality.slug }),
        },
        {
            key: 'beneficiaries' as const,
            label: 'Beneficiary Registry',
            icon: Users,
            href: BeneficiaryRegistryReportController.url({ municipality: currentMunicipality.slug }),
        },
    ];

    return (
        <nav className="grid grid-cols-2 gap-1 rounded-md bg-slate-100 p-1 sm:w-fit" aria-label="Action Center report type">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = active === tab.key;

                return (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                            selected ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

export function SummaryGrid({
    items,
}: {
    items: { label: string; value: ReactNode; detail?: string; accent?: 'slate' | 'amber' | 'emerald' | 'blue' }[];
}) {
    const accents = {
        slate: 'border-slate-200',
        amber: 'border-amber-300',
        emerald: 'border-emerald-300',
        blue: 'border-blue-300',
    };

    return (
        <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {items.map((item) => (
                <div key={item.label} className={`min-h-24 rounded-md border bg-white p-4 ${accents[item.accent ?? 'slate']}`}>
                    <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{item.label}</p>
                    <p className="mt-2 text-xl font-bold text-slate-950 tabular-nums sm:text-2xl">{item.value}</p>
                    {item.detail && <p className="mt-1 text-xs text-slate-500">{item.detail}</p>}
                </div>
            ))}
        </section>
    );
}

export function FiltersPanel({ children, onSubmit, onReset }: { children: ReactNode; onSubmit: () => void; onReset: () => void }) {
    return (
        <form
            className="rounded-md border border-slate-200 bg-slate-50/60 p-3 sm:p-4"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" className="h-10" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" /> Reset
                </Button>
                <Button type="submit" className="h-10 bg-slate-900 text-white hover:bg-slate-800">
                    <Filter className="h-4 w-4" /> Apply Filters
                </Button>
            </div>
        </form>
    );
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="min-w-0 space-y-1.5">
            <Label className="text-[11px] font-semibold tracking-wide text-slate-600 uppercase">{label}</Label>
            {children}
        </div>
    );
}

export function FilterSelect({
    value,
    placeholder,
    options,
    onChange,
    includeAll = true,
}: {
    value: string;
    placeholder: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    includeAll?: boolean;
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-10 w-full bg-white">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {includeAll && <SelectItem value={ALL_OPTION}>{placeholder}</SelectItem>}
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
    return <Input className="h-10 bg-white" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />;
}

export function buildExportUrl(path: string, filters: Record<string, string | number | null | undefined>): string {
    const params = new URLSearchParams();

    Object.entries(cleanFilters(filters)).forEach(([key, value]) => params.set(key, String(value)));

    return params.size > 0 ? `${path}?${params.toString()}` : path;
}

export function cleanFilters(filters: Record<string, string | number | null | undefined>): Record<string, string | number> {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== '' && value !== ALL_OPTION),
    ) as Record<string, string | number>;
}

export function formatCurrency(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value ?? 0);
}

export function formatDate(value: string | null | undefined): string {
    if (!value) return '-';

    return new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

export function StatusBadge({ status, label }: { status: string | null; label: string }) {
    const tones: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 ring-amber-200',
        under_review: 'bg-sky-50 text-sky-700 ring-sky-200',
        approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        released: 'bg-blue-50 text-blue-700 ring-blue-200',
        rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
        cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
        verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
        merged: 'bg-violet-50 text-violet-700 ring-violet-200',
    };

    return (
        <span className={`inline-flex rounded px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${tones[status ?? ''] ?? tones.cancelled}`}>
            {label}
        </span>
    );
}
