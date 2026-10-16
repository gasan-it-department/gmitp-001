import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Save, Search, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, useInventoryContext, useInventoryMutation } from '../Inventory/components';
import { DirectoryLayout } from '../Inventory/DirectoryLayout';
import ItemPicker from '../Inventory/ItemPicker';
import { CooldownNotice, useCooldownContext } from './Cooldown';
import type { CatalogRecord, GoodsRequest, Options, Permissions, Recipient } from './types';

export default function Form({
    request,
    options,
    selectedRecipient,
    filters,
    canRegister,
    permissions,
}: {
    request: GoodsRequest | null;
    options: Options;
    selectedRecipient: Recipient | null;
    filters: Record<string, string>;
    canRegister: boolean;
    permissions: Permissions;
}) {
    const { slug } = useInventoryContext();
    const routes = goodsDistribution.requests;
    const mutation = useInventoryMutation();
    const [recipient, setRecipient] = useState(selectedRecipient);
    const [search, setSearch] = useState('');
    const [candidates, setCandidates] = useState<Recipient[]>([]);
    const [searching, setSearching] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [program, setProgram] = useState(request?.program_id ?? filters.program_id ?? '');
    const [location, setLocation] = useState(request?.storage_location_id ?? '');
    const [subject, setSubject] = useState(request?.assisted_household_member_id ?? '');
    const cooldown = useCooldownContext({ programId: program, beneficiaryId: recipient?.id, memberId: subject });
    const [notes, setNotes] = useState(request?.notes ?? '');
    const [submissionKey] = useState(() => crypto.randomUUID());
    const [lines, setLines] = useState<{ key: string; item: CatalogRecord | null; quantity: string }[]>(
        request?.lines.map((l) => ({
            key: l.id,
            item: { id: l.item_id, name: l.item_name_snapshot, code: l.item_code_snapshot, base_unit: l.base_unit, is_active: true },
            quantity: l.quantity ?? '',
        })) ?? [{ key: crypto.randomUUID(), item: null, quantity: '' }],
    );
    const draftable = !request || request.status === 'draft';
    const enteredLines = lines.filter((line) => line.item || line.quantity.trim());
    const complete = enteredLines.length > 0 && enteredLines.every((line) => line.item && line.quantity.trim());
    const canEditRecipient = permissions.intake;
    const registry = async () => {
        setSearching(true);
        setLookupError('');
        try {
            const { data } = await axios.post<{ data: Recipient[] }>(
                routes.api.recipients.url(),
                { search },
                { headers: { 'X-Municipality-Slug': slug } },
            );
            setCandidates(data.data);
        } catch {
            setLookupError('Could not search the registry. Try again.');
        } finally {
            setSearching(false);
        }
    };
    return (
        <DirectoryLayout
            rootHref={routes.index.url({ municipality: slug })}
            title={request?.status === 'draft' ? 'Complete distribution draft' : request ? 'Edit distribution request' : 'New distribution request'}
            actions={
                <Button variant="outline" asChild>
                    <Link href={request ? routes.show.url({ municipality: slug, requestId: request.id }) : routes.index.url({ municipality: slug })}>
                        Cancel
                    </Link>
                </Button>
            }
        >
            <Errors errors={{ ...mutation.errors, ...(lookupError ? { lookup: lookupError } : {}) }} />
            <CooldownNotice {...cooldown} />
            <section className="space-y-3 border-b border-[#e8ede9] pb-5">
                <h2 className="text-base font-semibold">Recipient</h2>
                {canEditRecipient && (
                    <form
                        className="flex flex-wrap gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            void registry();
                        }}
                    >
                        <Input
                            aria-label="Search beneficiary registry"
                            placeholder="Name or beneficiary number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-80"
                            minLength={2}
                            required
                        />
                        <Button variant="outline" type="submit" disabled={searching}>
                            <Search className="size-4" />
                            {searching ? 'Searching' : 'Search registry'}
                        </Button>
                    </form>
                )}
                {canEditRecipient && canRegister && (
                    <Link
                        className="inline-flex items-center gap-2 text-sm text-[#245e4f] underline"
                        href={goodsDistribution.recipients.url({ municipality: slug })}
                    >
                        <Plus className="size-4" />
                        Register a person
                    </Link>
                )}
                {canEditRecipient &&
                    candidates.map((c) => (
                        <label key={c.id} className="flex items-start gap-3 border-b border-[#e8ede9] py-3 text-sm">
                            <input
                                type="radio"
                                name="recipient"
                                checked={recipient?.id === c.id}
                                onChange={() => {
                                    setRecipient(c);
                                    setSubject('');
                                }}
                            />
                            <span>
                                <strong>{c.name}</strong>
                                <span className="block text-xs text-muted-foreground">
                                    {c.birth_date} · {c.beneficiary_number} · {c.household_code}
                                </span>
                            </span>
                        </label>
                    ))}
                {recipient && (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <strong>{canEditRecipient ? recipient.name : request?.snapshot.filer.name}</strong>
                        <span>{canEditRecipient ? recipient.household_code : request?.snapshot.household_code}</span>
                        <span className={recipient.identity_verified ? 'text-emerald-700' : 'text-amber-700'}>
                            {recipient.identity_verified ? 'Identity verified' : 'Registry identity pending'}
                        </span>
                    </div>
                )}
            </section>
            <form
                className="space-y-6"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const intent = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value || (draftable ? 'submit' : 'save');
                    const result = await mutation.submit(
                        request ? routes.api.update.url({ requestId: request.id }) : routes.api.store.url(),
                        {
                            submission_key: submissionKey,
                            intent,
                            version: request?.version,
                            beneficiary_id: recipient?.id,
                            assisted_household_member_id: subject || null,
                            program_id: program,
                            storage_location_id: location,
                            notes,
                            lines: enteredLines.map((l) => ({ item_id: l.item?.id, quantity: l.quantity.trim() || null })),
                        },
                        request ? 'patch' : 'post',
                    );
                    if (result) router.visit(routes.show.url({ municipality: slug, requestId: result.id }));
                }}
            >
                <div className="grid gap-4 @min-[800px]/goods:grid-cols-3">
                    <Field label="Assistance intended for">
                        <select
                            className={inputClass}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={!recipient || !canEditRecipient}
                        >
                            <option value="">Filer personally</option>
                            {request?.assisted_household_member_id &&
                                !recipient?.roster.some((member) => member.id === request.assisted_household_member_id) && (
                                    <option value={request.assisted_household_member_id}>{request.snapshot.subject.name}</option>
                                )}
                            {recipient?.roster
                                .filter((m) => m.beneficiary_id !== recipient.id)
                                .map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                        </select>
                    </Field>
                    <Field label="Program">
                        <select
                            required
                            className={inputClass}
                            disabled={!!request}
                            value={program}
                            onChange={(e) => {
                                setProgram(e.target.value);
                                setLines([{ key: crypto.randomUUID(), item: null, quantity: '' }]);
                            }}
                        >
                            <option value="">Select program</option>
                            {options.programs.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Storage location">
                        <select required className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)}>
                            <option value="">Select storage</option>
                            {options.locations.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>
                <section className="space-y-4 border-y border-[#e8ede9] py-5">
                    <header className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-semibold">Goods</h2>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!program}
                            onClick={() => setLines([...lines, { key: crypto.randomUUID(), item: null, quantity: '' }])}
                        >
                            <Plus className="size-4" />
                            Add item
                        </Button>
                    </header>
                    {lines.map((line, index) => (
                        <div className="grid grid-cols-[minmax(0,1fr)_44px] items-end gap-3 [&>label:first-child]:col-span-2 @min-[560px]/goods:grid-cols-[minmax(0,1fr)_160px_44px] @min-[560px]/goods:[&>label:first-child]:col-span-1" key={line.key}>
                            <Field label={`Item ${index + 1}`}>
                                {program ? (
                                    <ItemPicker
                                        value={line.item}
                                        required={!!line.item || !!line.quantity.trim()}
                                        programId={program}
                                        searchUrl={routes.api.items.url()}
                                        onChange={(item) => setLines(lines.map((l) => (l.key === line.key ? { ...l, item } : l)))}
                                    />
                                ) : (
                                    <Input disabled placeholder="Select program first" />
                                )}
                            </Field>
                            <Field label={`Quantity (${line.item?.base_unit ?? 'unit'})`}>
                                <Input
                                    required={!!line.item}
                                    inputMode="decimal"
                                    value={line.quantity}
                                    onChange={(e) => setLines(lines.map((l) => (l.key === line.key ? { ...l, quantity: e.target.value } : l)))}
                                />
                            </Field>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Remove item"
                                aria-label="Remove item"
                                onClick={() => setLines(lines.filter((l) => l.key !== line.key))}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </section>
                <Field label="Notes">
                    <textarea className={`${inputClass} h-24 py-2`} value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} />
                </Field>
                <div className="flex flex-wrap gap-2">
                    {draftable && (
                        <Button
                            type="submit"
                            name="intent"
                            value="draft"
                            formNoValidate
                            variant="outline"
                            disabled={mutation.busy || !recipient || !program || !location}
                        >
                            <Save className="size-4" />
                            Save as draft
                        </Button>
                    )}
                    <Button
                        type="submit"
                        name="intent"
                        value={draftable ? 'submit' : 'save'}
                        disabled={mutation.busy || !recipient || !program || !location || !complete}
                        className="bg-[#245e4f] text-white shadow-none"
                    >
                        {draftable ? <Send className="size-4" /> : <Save className="size-4" />}
                        {mutation.busy ? 'Saving' : draftable ? 'Submit for review' : 'Save request'}
                    </Button>
                </div>
            </form>
        </DirectoryLayout>
    );
}
