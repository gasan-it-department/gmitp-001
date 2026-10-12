import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Power, Save } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, Filters, inputClass, useInventoryContext, useInventoryMutation } from './components';
import { DirectoryLayout, DirectoryPagination, DirectoryPanel, DirectoryStatus } from './DirectoryLayout';
import ItemCategorySelect from './ItemCategorySelect';
import ItemDialog from './ItemDialog';
import type { CatalogKind, CatalogRecord, CommonProps, PageData } from './types';

const titles: Record<CatalogKind, string> = { items: 'Items', programs: 'Programs', sources: 'Sources / Donors', locations: 'Storage Locations' };
const blank = {
    name: '',
    is_active: true,
    base_unit: 'kg',
    category: '',
    description: '',
    source_type: 'private_donor',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    notes: '',
};

export default function Catalog({ kind, records, canManage, filters }: CommonProps & { kind: CatalogKind; records: PageData<CatalogRecord> }) {
    const { slug } = useInventoryContext();
    const api = goodsDistribution.inventory.api.catalog;
    const mutation = useInventoryMutation();
    const [editing, setEditing] = useState<CatalogRecord | null>(null);
    const [initialActive, setInitialActive] = useState<boolean | undefined>();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(blank);
    const settings = kind === 'sources' || kind === 'locations';
    const url = settings
        ? goodsDistribution.inventory.settings.url({ municipality: slug })
        : kind === 'items'
          ? goodsDistribution.inventory.items.url({ municipality: slug })
          : goodsDistribution.inventory.programs.url({ municipality: slug });
    const edit = (record: CatalogRecord | null, active?: boolean) => {
        setEditing(record);
        setInitialActive(active);
        setForm({ ...blank, ...Object.fromEntries(Object.entries(record ?? {}).map(([key, value]) => [key, value ?? ''])) } as typeof blank);
        mutation.clearErrors();
        setOpen(true);
    };
    const save = async (data = form, record = editing) => {
        const result = await mutation.submit(
            record ? api.update.url({ catalog: kind, recordId: record.id }) : api.store.url({ catalog: kind }),
            data,
            record ? 'patch' : 'post',
        );
        if (result) {
            setOpen(false);
            router.reload();
        }
    };
    const text = (field: keyof typeof blank, label: string, required = false) => (
        <Field label={label}>
            <Input
                required={required}
                value={String(form[field])}
                maxLength={255}
                onChange={(event) => setForm({ ...form, [field]: field === 'name' ? event.target.value.toUpperCase() : event.target.value })}
            />
        </Field>
    );
    return (
        <DirectoryLayout
            title={settings ? 'Settings' : titles[kind]}
            actions={
                canManage && (
                    <Button className="h-9 bg-[#245e4f] text-white shadow-none hover:bg-[#194c3e]" onClick={() => edit(null)}>
                        <Plus className="size-4" />
                        Add {kind === 'items' ? 'item' : kind === 'programs' ? 'program' : kind === 'sources' ? 'source' : 'location'}
                    </Button>
                )
            }
        >
            {settings && (
                <Tabs value={kind} onValueChange={(value) => router.get(url, { kind: value })}>
                    <TabsList className="bg-[#eaf1ed] shadow-none">
                        {(['sources', 'locations'] as const).map((value) => (
                            <TabsTrigger key={value} value={value}>
                                {titles[value]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}
            <Errors errors={!open ? mutation.errors : {}} />
            <DirectoryPanel
                label={titles[kind]}
                countLabel={`${records.meta.total.toLocaleString()} records`}
                toolbar={<Filters appearance="directory" filters={settings ? { ...filters, kind } : filters} url={url} />}
            >
                <table className="w-full table-fixed text-left text-sm">
                    <thead className="hidden border-y border-[#e8ede9] bg-[#f8faf9] text-xs text-[#75827c] lg:table-header-group">
                        <tr>
                            {['Name', 'Code', kind === 'items' ? 'Unit' : 'Details', 'Status', ''].map((label, index) => (
                                <th key={index} className="px-3 py-3 font-medium">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block lg:table-row-group">
                        {records.data.map((record) => (
                            <tr
                                key={record.id}
                                className="grid grid-cols-2 border-b border-[#e8ede9] last:border-b-0 hover:bg-[#fafcfb] lg:table-row"
                            >
                                <td className="col-span-2 min-w-0 px-5 py-4 font-medium [overflow-wrap:anywhere] lg:col-span-1">{record.name}</td>
                                <td className="min-w-0 px-3 py-4 font-mono text-xs [overflow-wrap:anywhere] text-[#75827c]">
                                    <span className="block font-sans lg:hidden">Code</span>
                                    {record.code}
                                </td>
                                <td className="min-w-0 px-3 py-4 [overflow-wrap:anywhere]">
                                    <span className="block text-xs text-[#75827c] lg:hidden">{kind === 'items' ? 'Unit' : 'Details'}</span>
                                    {record.base_unit ?? record.source_type?.replaceAll('_', ' ') ?? record.description ?? record.address ?? '-'}
                                </td>
                                <td className="px-3 py-3">
                                    <DirectoryStatus active={record.is_active} />
                                </td>
                                <td className="px-3 py-3">
                                    {canManage && (
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                className="text-[#607d6b] hover:bg-[#eaf1ed]"
                                                variant="ghost"
                                                size="icon"
                                                title={`Edit ${record.name}`}
                                                aria-label={`Edit ${record.name}`}
                                                onClick={() => edit(record)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                className="text-[#607d6b] hover:bg-[#eaf1ed]"
                                                variant="ghost"
                                                size="icon"
                                                disabled={mutation.busy}
                                                title={record.is_active ? 'Deactivate' : 'Activate'}
                                                aria-label={record.is_active ? 'Deactivate' : 'Activate'}
                                                onClick={() =>
                                                    kind === 'items' && record.connected_programs?.length
                                                        ? edit(record, !record.is_active)
                                                        : void save({ ...blank, ...record, is_active: !record.is_active } as typeof blank, record)
                                                }
                                            >
                                                <Power className="size-4" />
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!records.data.length && <p className="py-12 text-center text-sm text-[#75827c]">No {titles[kind].toLowerCase()} found.</p>}
                <DirectoryPagination records={records} />
            </DirectoryPanel>
            {kind === 'items' && open && (
                <ItemDialog
                    item={editing}
                    initialActive={initialActive}
                    onClose={() => setOpen(false)}
                    onSaved={() => {
                        setOpen(false);
                        router.reload();
                    }}
                />
            )}
            <Dialog
                open={open && kind !== 'items'}
                onOpenChange={(value) => {
                    if (!mutation.busy) setOpen(value);
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dfe6e1] text-[#243c33] sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit' : 'Add'}{' '}
                            {kind === 'items' ? 'item' : kind === 'programs' ? 'program' : kind === 'sources' ? 'source' : 'storage location'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void save();
                        }}
                    >
                        <Errors errors={mutation.errors} />
                        <div className="grid gap-4 sm:grid-cols-2">
                            {text('name', 'Name', true)}
                            {editing && (
                                <Field label="Code">
                                    <Input readOnly value={editing.code} />
                                </Field>
                            )}
                            {kind === 'items' && (
                                <>
                                    <Field label="Base unit">
                                        <select
                                            className={inputClass}
                                            disabled={editing?.base_unit_locked}
                                            value={form.base_unit}
                                            onChange={(event) => setForm({ ...form, base_unit: event.target.value })}
                                        >
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="piece">Pieces</option>
                                        </select>
                                    </Field>
                                    <ItemCategorySelect
                                        value={form.category}
                                        legacyValue={editing?.category}
                                        onChange={(category) => setForm({ ...form, category })}
                                    />
                                </>
                            )}
                            {kind === 'sources' && (
                                <>
                                    <Field label="Source type">
                                        <select
                                            className={inputClass}
                                            value={form.source_type}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    source_type: event.target.value,
                                                    ...(event.target.value === 'unknown' && !editing && !form.name
                                                        ? { name: 'UNKNOWN HISTORICAL SOURCE' }
                                                        : {}),
                                                })
                                            }
                                        >
                                            {['private_donor', 'government', 'lgu', 'other', 'unknown'].map((value) => (
                                                <option key={value} value={value}>
                                                    {value === 'unknown' ? 'Unknown historical source' : value.replaceAll('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    {text('contact_name', 'Contact name')}
                                    {text('contact_phone', 'Contact phone')}
                                    {text('contact_email', 'Contact email')}
                                </>
                            )}
                            {kind === 'locations' && text('address', 'Address')}
                        </div>
                        <Field label={kind === 'items' || kind === 'programs' ? 'Description' : 'Notes'}>
                            <textarea
                                className={`${inputClass} h-24 py-2`}
                                maxLength={2000}
                                value={kind === 'items' || kind === 'programs' ? form.description : form.notes}
                                onChange={(event) =>
                                    setForm({ ...form, [kind === 'items' || kind === 'programs' ? 'description' : 'notes']: event.target.value })
                                }
                            />
                        </Field>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                            />
                            Active
                        </label>
                        <DialogFooter>
                            <Button type="button" variant="outline" disabled={mutation.busy} onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button className="bg-[#245e4f] text-white hover:bg-[#194c3e]" type="submit" disabled={mutation.busy}>
                                <Save className="size-4" />
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DirectoryLayout>
    );
}
