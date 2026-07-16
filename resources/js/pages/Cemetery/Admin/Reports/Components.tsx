import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReportFilterOption, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, Filter, X } from 'lucide-react';
import { ReactNode } from 'react';

export type ReportFilters = Record<string, string | number | null | undefined>;

export function ReportHeader({
    title,
    description,
    backHref,
    exportHref,
}: {
    title: string;
    description: string;
    backHref: string;
    exportHref?: string;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
                <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft size={16} />
                    Back to reports
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>

            {exportHref && (
                <a href={exportHref}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                </a>
            )}
        </div>
    );
}

export function SummaryCards({
    items,
}: {
    items: { label: string; value: number | string; tone?: 'slate' | 'emerald' | 'amber' | 'rose' | 'sky' }[];
}) {
    const tones = {
        slate: 'bg-slate-50 text-slate-700 ring-slate-200',
        emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        amber: 'bg-amber-50 text-amber-700 ring-amber-200',
        rose: 'bg-rose-50 text-rose-700 ring-rose-200',
        sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    };

    return (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.label} className={`ring-1 ring-inset ${tones[item.tone ?? 'slate']}`}>
                    <CardContent className="p-4">
                        <p className="text-xs font-medium tracking-wide uppercase">{item.label}</p>
                        <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

export function FilterPanel({ children, onApply, onClear }: { children: ReactNode; onApply: () => void; onClear: () => void }) {
    return (
        <Card>
            <CardContent className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={onApply}>
                        <Filter className="mr-2 h-4 w-4" />
                        Apply Filters
                    </Button>
                    <Button type="button" variant="outline" onClick={onClear}>
                        <X className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function ReportSelect<T extends string>({
    label,
    value,
    options,
    onChange,
    allLabel = 'All',
    includeEmptyOption = true,
}: {
    label: string;
    value: T | string | null;
    options: SelectOption<T>[] | ReportFilterOption[];
    onChange: (value: string | null) => void;
    allLabel?: string;
    includeEmptyOption?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <select
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value || null)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
                {includeEmptyOption && <option value="">{allLabel}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function ReportInput({
    label,
    value,
    type = 'text',
    onChange,
}: {
    label: string;
    value: string | number | null;
    type?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input value={value ?? ''} type={type} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

export function ReportPagination<T>({ rows }: { rows: PaginatedResponse<T> }) {
    if (rows.meta.last_page <= 1) {
        return null;
    }

    return <Pagination links={rows.meta.links} />;
}

export function visitReport(path: string, filters: ReportFilters, page = 1) {
    router.get(path, cleanQuery({ ...filters, page }), {
        preserveScroll: true,
        preserveState: true,
    });
}

export function exportUrl(path: string, filters: ReportFilters): string {
    const params = new URLSearchParams();

    Object.entries(cleanQuery(filters)).forEach(([key, value]) => {
        params.set(key, String(value));
    });

    const query = params.toString();

    return query ? `${path}?${query}` : path;
}

export function cleanQuery(filters: ReportFilters): Record<string, string | number> {
    const query: Record<string, string | number> = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            return;
        }

        query[key] = value;
    });

    return query;
}

export function formatBlank(value: ReactNode): ReactNode {
    return value === null || value === undefined || value === '' ? '-' : value;
}
