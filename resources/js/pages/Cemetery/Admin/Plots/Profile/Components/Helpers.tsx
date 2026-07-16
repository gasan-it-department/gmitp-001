import { Label } from '@/components/ui/label';
import { ReactNode } from 'react';

export const toneClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function Stat({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="bg-white p-4">
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{value ?? '-'}</div>
        </div>
    );
}

export function Detail({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{value || '-'}</div>
        </div>
    );
}

export function Pill({ children }: { children: ReactNode }) {
    return <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100 ring-1 ring-white/15">{children}</span>;
}

export function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            {icon}
            {text}
        </div>
    );
}

export function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}

export function buildApartmentSlotName(
    apartmentName: string,
    floor: number,
    rowPrefix: string,
    row: number,
    nichePrefix: string,
    niche: number,
    nichePadding: number | '',
) {
    const paddedNiche = nichePadding === '' || nichePadding <= 0 ? String(niche) : String(niche).padStart(nichePadding, '0');

    return `${apartmentName}-F${floor}-${rowPrefix}${row}-${nichePrefix}${paddedNiche}`;
}

export function formatDate(value: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(value));
}

export function formatCurrency(value: string | number | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(Number(value));
}

export function toNumberOrBlank(value: string | number | null | undefined): number | '' {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    return Number(value);
}

export function formatDateTime(value: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}
