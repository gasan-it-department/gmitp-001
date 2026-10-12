import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import axios from 'axios';
import { Check, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, StateBadge, useInventoryContext } from './components';
import ItemCategorySelect, { useItemCategories } from './ItemCategorySelect';
import type { CatalogRecord } from './types';

type Candidate = CatalogRecord & { match_type: 'exact' | 'possible' };
type CheckResult = { matches: Candidate[]; reviewed_item_ids: string[] };

export default function ItemDialog({
    item,
    initialName = '',
    receiving = false,
    programId,
    initialActive,
    onClose,
    onSaved,
}: {
    item?: CatalogRecord | null;
    initialName?: string;
    receiving?: boolean;
    programId?: string | null;
    initialActive?: boolean;
    onClose: () => void;
    onSaved: (item: CatalogRecord) => void;
}) {
    const { slug } = useInventoryContext();
    const categories = useItemCategories();
    const headers = { 'X-Municipality-Slug': slug };
    const [form, setForm] = useState({
        name: item?.name ?? initialName.toUpperCase(),
        base_unit: item?.base_unit ?? 'kg',
        category: item?.category ?? '',
        description: item?.description ?? '',
        is_active: initialActive ?? item?.is_active ?? true,
    });
    const [result, setResult] = useState<CheckResult | null>(null);
    const [checkedKey, setCheckedKey] = useState('');
    const [reason, setReason] = useState('');
    const [distinct, setDistinct] = useState(false);
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [confirmShared, setConfirmShared] = useState(false);
    const [reactivating, setReactivating] = useState<Candidate | null>(null);
    const sharedChanged =
        !!item?.connected_programs?.length && Object.entries(form).some(([key, value]) => value !== (item[key as keyof CatalogRecord] ?? ''));
    const identityKey = JSON.stringify([form.name, form.base_unit]);
    const unchanged = !!item && form.name === item.name && form.base_unit === item.base_unit;
    const checked = unchanged || checkedKey === identityKey;
    const exact = !unchanged && result?.matches.some((match) => match.match_type === 'exact');
    const possible = !unchanged && !!result?.matches.length;
    const fail = (error: unknown) => {
        const data = axios.isAxiosError(error) ? error.response?.data : null;
        setErrors(
            data?.errors
                ? Object.fromEntries(
                      Object.entries(data.errors).map(([key, value]) => [key, Array.isArray(value) ? String(value[0]) : String(value)]),
                  )
                : { item: data?.message ?? 'Could not save the item. Try again.' },
        );
    };
    const check = async () => {
        setBusy(true);
        setErrors({});
        setDistinct(false);
        setReason('');
        try {
            const response = await axios.post<{ data: CheckResult }>(
                goodsDistribution.inventory.api.items.check.url(),
                {
                    name: form.name,
                    base_unit: form.base_unit,
                    exclude_id: item?.id,
                },
                { headers },
            );
            setResult(response.data.data);
            setCheckedKey(identityKey);
        } catch (error) {
            fail(error);
        } finally {
            setBusy(false);
        }
    };
    const save = async () => {
        if (!checked) {
            await check();
            return;
        }
        setBusy(true);
        setErrors({});
        try {
            const response = await axios.request<{ data: CatalogRecord }>({
                url: item
                    ? goodsDistribution.inventory.api.catalog.update.url({ catalog: 'items', recordId: item.id })
                    : programId
                      ? goodsDistribution.inventory.api.programItems.create.url({ programId })
                      : goodsDistribution.inventory.api.catalog.store.url({ catalog: 'items' }),
                method: item ? 'patch' : 'post',
                headers,
                data: {
                    ...form,
                    confirm_shared_change: confirmShared,
                    reviewed_item_ids: unchanged ? [] : (result?.reviewed_item_ids ?? []),
                    duplicate_reason: possible ? reason.trim() : null,
                },
            });
            onSaved(response.data.data);
        } catch (error) {
            fail(error);
            setCheckedKey('');
        } finally {
            setBusy(false);
        }
    };
    const selectExisting = async (candidate: Candidate, confirmed = false) => {
        if (!candidate.is_active && !confirmed) {
            setReactivating(candidate);
            return;
        }
        if (candidate.is_active && !programId) {
            onSaved(candidate);
            return;
        }
        setBusy(true);
        setErrors({});
        try {
            if (programId) {
                const response = await axios.post<{ data: { item: CatalogRecord } }>(
                    goodsDistribution.inventory.api.programItems.store.url({ programId }),
                    { item_id: candidate.id, reactivate_global: confirmed },
                    { headers },
                );
                onSaved(response.data.data.item);
                return;
            }
            const response = await axios.patch<{ data: CatalogRecord }>(
                goodsDistribution.inventory.api.catalog.update.url({ catalog: 'items', recordId: candidate.id }),
                { ...candidate, is_active: true, confirm_shared_change: confirmed },
                { headers },
            );
            onSaved(response.data.data);
        } catch (error) {
            fail(error);
        } finally {
            setBusy(false);
        }
    };
    const identityChange = (field: 'name' | 'base_unit', value: string) => {
        setForm({ ...form, [field]: field === 'name' ? value.toUpperCase() : value });
        setResult(null);
        setCheckedKey('');
        setDistinct(false);
        setReason('');
    };
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !busy) onClose();
            }}
        >
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit shared item' : 'Add item'}</DialogTitle>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void save();
                    }}
                >
                    <Errors errors={errors} />
                    {sharedChanged && (
                        <section className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                            <p>
                                This shared item is connected to {item?.connected_programs?.map((entry) => entry.name).join(', ')}. Changes apply to
                                every connected program; saved receipt history stays unchanged.
                            </p>
                            <label className="flex items-start gap-2">
                                <input
                                    className="mt-1"
                                    type="checkbox"
                                    checked={confirmShared}
                                    onChange={(event) => setConfirmShared(event.target.checked)}
                                />
                                I confirm this shared catalog change.
                            </label>
                        </section>
                    )}
                    {reactivating && (
                        <section className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                            <p>
                                Reactivate {reactivating.name} in the shared catalog? This also restores its availability in connected programs with
                                enabled items
                                {reactivating.connected_programs?.length
                                    ? `: ${reactivating.connected_programs.map((entry) => entry.name).join(', ')}`
                                    : ''}
                                .
                            </p>
                            <Button type="button" size="sm" disabled={busy} onClick={() => void selectExisting(reactivating, true)}>
                                Confirm reactivation
                            </Button>
                            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setReactivating(null)}>
                                Cancel
                            </Button>
                        </section>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Item name">
                            <Input required maxLength={255} value={form.name} onChange={(event) => identityChange('name', event.target.value)} />
                        </Field>
                        {item && (
                            <Field label="Code">
                                <Input readOnly value={item.code} />
                            </Field>
                        )}
                        <Field label="Base unit">
                            <select
                                className={inputClass}
                                disabled={item?.base_unit_locked}
                                value={form.base_unit}
                                onChange={(event) => identityChange('base_unit', event.target.value)}
                            >
                                <option value="kg">Kilograms (kg)</option>
                                <option value="piece">Pieces</option>
                            </select>
                        </Field>
                        <ItemCategorySelect
                            value={form.category}
                            legacyValue={item?.category}
                            onChange={(category) => setForm({ ...form, category })}
                        />
                    </div>
                    <Field label="Description">
                        <textarea
                            className={`${inputClass} h-20 py-2`}
                            maxLength={2000}
                            value={form.description}
                            onChange={(event) => setForm({ ...form, description: event.target.value })}
                        />
                    </Field>
                    {!receiving && (
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                            />
                            Active in shared catalog
                        </label>
                    )}
                    {result && checked && !unchanged && (
                        <section className="space-y-3 border-t border-border pt-4" aria-live="polite">
                            <h3 className="text-sm font-semibold">
                                {result.matches.length ? 'Existing items to review' : 'No possible match found'}
                            </h3>
                            {result.matches.map((candidate) => (
                                <div key={candidate.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium break-words">{candidate.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {candidate.code} · {candidate.base_unit}{' '}
                                            {candidate.category ? `· ${categories.label(candidate.category)}` : ''}
                                        </p>
                                        <div className="mt-1 flex gap-2">
                                            <StateBadge value={candidate.is_active ? 'active' : 'inactive'} />
                                            <StateBadge value={candidate.match_type === 'exact' ? 'same name and unit' : 'possible match'} />
                                        </div>
                                    </div>
                                    <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void selectExisting(candidate)}>
                                        {candidate.is_active ? 'Use existing item' : 'Reactivate and use'}
                                    </Button>
                                </div>
                            ))}
                            {!!possible && !exact && (
                                <>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={distinct} onChange={(event) => setDistinct(event.target.checked)} />
                                        Create a distinct item
                                    </label>
                                    {distinct && (
                                        <Field label="How is this item different?">
                                            <textarea
                                                required
                                                minLength={5}
                                                maxLength={1000}
                                                className={`${inputClass} h-20 py-2`}
                                                value={reason}
                                                onChange={(event) => setReason(event.target.value)}
                                            />
                                        </Field>
                                    )}
                                </>
                            )}
                        </section>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                busy ||
                                (sharedChanged && !confirmShared) ||
                                !!exact ||
                                (checked && !!possible && (!distinct || reason.trim().length < 5))
                            }
                        >
                            {busy ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : checked ? (
                                <Check className="size-4" />
                            ) : (
                                <Search className="size-4" />
                            )}
                            {checked ? (item ? 'Save item' : 'Create item') : 'Check existing items'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
