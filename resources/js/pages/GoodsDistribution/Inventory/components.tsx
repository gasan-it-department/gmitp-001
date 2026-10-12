import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Options, PageData, Program, Receipt } from './types';

export function withProgram(url: string, programId?: string | null) {
    if (!programId) return url;
    const [path, query = ''] = url.split('?');
    const params = new URLSearchParams(query);
    params.set('program_id', programId);
    return `${path}?${params}`;
}

export function programUrl(slug: string, programId: string, action?: 'create' | 'edit', receiptId?: string) {
    const args = { municipality: slug, programId };
    if (action === 'create') return goodsDistribution.inventory.programsReceiptsCreate.url(args);
    if (action === 'edit' && receiptId) return goodsDistribution.inventory.programsReceiptsEdit.url({ ...args, receiptId });
    return goodsDistribution.inventory.programsShow.url(args);
}

export function ReceiptPrograms({ receipt }: { receipt: Receipt }) {
    const programs = receipt.programs ?? [
        ...new Map((receipt.lines ?? []).map((line) => [line.program_id, { id: line.program_id, name: line.program_name ?? 'Unassigned' }])).values(),
    ];
    return (
        <div className="flex flex-wrap items-center gap-2 text-xs">
            {(receipt.is_mixed_program || programs.length > 1) && <StateBadge value="Mixed programs" />}
            {programs.map((program) => (
                <span key={program.id ?? 'unassigned'}>{program.name}</span>
            ))}
        </div>
    );
}

export const inputClass = 'h-10 w-full min-w-0 rounded-md border border-gray-300 bg-background px-3 text-sm text-foreground disabled:bg-muted';

export function useInventoryContext() {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    return { slug: currentMunicipality.slug };
}

export function useInventoryMutation() {
    const { slug } = useInventoryContext();
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const submit = async (url: string, data: object, method: 'post' | 'patch' = 'post') => {
        setBusy(true);
        setErrors({});
        try {
            const response = await axios.request<{ data: { id: string }; message: string }>({
                url,
                method,
                data,
                headers: { 'X-Municipality-Slug': slug },
            });
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const response = error.response?.data as { message?: string; errors?: Record<string, string | string[]> } | undefined;
                setErrors(
                    response?.errors
                        ? Object.fromEntries(Object.entries(response.errors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]))
                        : { inventory: response?.message ?? 'Could not update inventory. Try again.' },
                );
            } else setErrors({ inventory: 'Could not update inventory. Try again.' });
            return null;
        } finally {
            setBusy(false);
        }
    };
    return { submit, busy, errors, clearErrors: () => setErrors({}) };
}

export function InventoryShell({
    title,
    children,
    actions,
    program,
}: {
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    program?: Program | null;
}) {
    const { slug } = useInventoryContext();
    return (
        <AdminLayout>
            <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <div className="min-w-0 flex-1">
                        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                            <Link href={goodsDistribution.inventory.programs.url({ municipality: slug })}>Goods Distribution</Link>
                            <ChevronRight className="size-3" />
                            {program ? (
                                <Link href={goodsDistribution.inventory.programs.url({ municipality: slug })}>Programs</Link>
                            ) : (
                                <span aria-current="page">{title}</span>
                            )}
                            {program && (
                                <>
                                    <ChevronRight className="size-3" />
                                    <Link className="break-words" href={programUrl(slug, program.id)}>
                                        {program.name}
                                    </Link>
                                </>
                            )}
                        </nav>
                        <h1 className="mt-1 text-2xl font-semibold break-words">{title}</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">{actions}</div>
                </header>
                {children}
            </main>
        </AdminLayout>
    );
}

export function Errors({ errors }: { errors: Record<string, string> }) {
    const messages = [...new Set(Object.values(errors))];
    return messages.length ? (
        <div role="alert" className="space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {messages.map((message) => (
                <p key={message}>{message}</p>
            ))}
        </div>
    ) : null;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="grid min-w-0 gap-1.5">
            <Label asChild>
                <span>{label}</span>
            </Label>
            {children}
        </label>
    );
}

export function StateBadge({ value }: { value: string }) {
    const color =
        ['posted', 'active', 'approved', 'released', 'verified', 'consumed'].includes(value)
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : ['voided', 'expired', 'cancelled', 'rejected'].includes(value)
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-gray-200 bg-gray-50 text-gray-700';
    return <span className={`inline-flex rounded border px-2 py-0.5 text-xs whitespace-nowrap capitalize ${color}`}>{value}</span>;
}

export function quantity(value: string | number): string {
    const [whole, fraction = ''] = String(value).split('.');
    const decimal = fraction.replace(/0+$/, '');
    return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decimal ? `.${decimal}` : '');
}

export function Pagination<T>({ records }: { records: PageData<T> }) {
    const { program, filters } = usePage<{ program?: Program | null; filters?: Record<string, string> }>().props;
    const scoped = (url: string) => withProgram(url, program?.id ?? filters?.program_id);
    return (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">
                {records.meta.from ?? 0}-{records.meta.to ?? 0} of {records.meta.total}
            </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    title="Previous page"
                    aria-label="Previous page"
                    disabled={!records.links.prev}
                    onClick={() => records.links.prev && router.visit(scoped(records.links.prev), { preserveState: true, preserveScroll: true })}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <span>
                    {records.meta.current_page} / {records.meta.last_page}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    title="Next page"
                    aria-label="Next page"
                    disabled={!records.links.next}
                    onClick={() => records.links.next && router.visit(scoped(records.links.next), { preserveState: true, preserveScroll: true })}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </footer>
    );
}

export function Filters({
    filters,
    options,
    url,
    children,
    program,
    period = false,
    stock = false,
    appearance = 'default',
}: {
    filters: Record<string, string>;
    options?: Options;
    url: string;
    children?: ReactNode;
    program?: Program | null;
    period?: boolean;
    stock?: boolean;
    appearance?: 'default' | 'directory';
}) {
    const [values, setValues] = useState(filters);
    const [loading, setLoading] = useState(false);
    const directory = appearance === 'directory';
    const controlClass = directory
        ? 'h-9 w-full min-w-0 rounded-md border border-[#dfe6e1] bg-[#fafcfb] px-3 text-sm text-[#426052] focus-visible:outline-2 focus-visible:outline-[#709d8c]'
        : inputClass;
    const apply = (nextValues = values) =>
        router.get(
            url,
            Object.fromEntries(
                Object.entries({
                    ...nextValues,
                    ...(program ? { program_id: program.id } : {}),
                    ...(period && !nextValues.year ? { quarter: '' } : {}),
                }).filter(([key, value]) => value && !['page', 'batch_page', 'movement_page'].includes(key)),
            ),
            { preserveState: false, preserveScroll: true, onStart: () => setLoading(true), onFinish: () => setLoading(false) },
        );
    const select = (field: string, label: string, rows: Array<{ id: string; name: string }>) => (
        <select
            aria-label={label}
            className={`${controlClass} ${directory ? 'sm:w-40' : 'sm:w-44'}`}
            value={values[field] ?? ''}
            onChange={(event) => setValues({ ...values, [field]: event.target.value })}
        >
            <option value="">{label}</option>
            {rows.map((row) => (
                <option key={row.id} value={row.id}>
                    {row.name}
                </option>
            ))}
        </select>
    );
    return (
        <form
            className={`flex flex-wrap items-end gap-2 ${directory ? 'w-full' : ''}`}
            onSubmit={(event) => {
                event.preventDefault();
                apply();
            }}
        >
            <div className={directory ? 'relative w-full sm:w-56' : 'contents'}>
                {directory && <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8b988f]" />}
                <Input
                    aria-label="Search"
                    placeholder={directory ? 'Search name or code' : 'Search'}
                    maxLength={100}
                    className={
                        directory
                            ? 'h-9 w-full border-[#dfe6e1] bg-[#fafcfb] pr-9 pl-9 text-sm shadow-none placeholder:text-[#8b988f] focus-visible:border-[#709d8c] focus-visible:ring-[#709d8c]/20'
                            : 'w-full sm:w-56'
                    }
                    value={values.search ?? ''}
                    onChange={(event) => setValues({ ...values, search: event.target.value })}
                />
                {directory && values.search && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        title="Clear search"
                        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-[#748078] hover:text-[#245e4f]"
                        onClick={() => {
                            const next = { ...values, search: '' };
                            setValues(next);
                            apply(next);
                        }}
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>
            {options && (
                <>
                    {select('source_id', 'All sources', options.sources)}
                    {!program && select('program_id', 'All programs', [{ id: 'unassigned', name: 'Unassigned' }, ...options.programs])}
                    {select('location_id', 'All storage', options.locations)}
                    <select
                        aria-label="Expiry"
                        className={`${controlClass} sm:w-40`}
                        value={values.expiry ?? ''}
                        onChange={(event) => setValues({ ...values, expiry: event.target.value })}
                    >
                        <option value="">All expiry dates</option>
                        <option value="expired">Expired</option>
                        <option value="soon">Within 30 days</option>
                        <option value="none">No expiry date</option>
                    </select>
                </>
            )}
            {period && (
                <>
                    <Input
                        type="number"
                        min="1900"
                        max="9999"
                        aria-label="Year"
                        placeholder="All years"
                        className="w-full sm:w-32"
                        value={values.year ?? ''}
                        onChange={(event) => setValues({ ...values, year: event.target.value, quarter: '' })}
                    />
                    <select
                        aria-label="Quarter"
                        className={`${inputClass} sm:w-40`}
                        disabled={!values.year}
                        value={values.year ? (values.quarter ?? '') : ''}
                        onChange={(event) => setValues({ ...values, quarter: event.target.value })}
                    >
                        <option value="">All quarters</option>
                        {[1, 2, 3, 4].map((quarter) => (
                            <option key={quarter} value={quarter}>
                                Quarter {quarter}
                            </option>
                        ))}
                    </select>
                </>
            )}
            {stock && (
                <label className={`flex items-center gap-2 text-sm ${directory ? 'h-9 flex-1 text-xs text-[#748078] sm:flex-none' : 'h-10'}`}>
                    <input
                        type="checkbox"
                        className={directory ? 'accent-[#245e4f]' : undefined}
                        checked={values.include_zero === '1'}
                        onChange={(event) => setValues({ ...values, include_zero: event.target.checked ? '1' : '' })}
                    />
                    Include zero stock
                </label>
            )}
            {children}
            <Button
                variant="outline"
                type="submit"
                disabled={loading}
                aria-label="Search"
                title="Search"
                size={directory ? 'icon' : 'default'}
                className={directory ? 'size-9 shrink-0 border-[#dfe6e1] text-[#426052] shadow-none hover:bg-[#edf3ef]' : undefined}
            >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                {!directory && 'Search'}
            </Button>
        </form>
    );
}
