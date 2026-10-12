import { Button } from '@/components/ui/button';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, useInventoryContext } from './components';

interface Requirement {
    document_type_id: string;
    is_required: boolean;
    evidence_mode: 'physical' | 'upload' | 'both';
    physical_copy_requirement: string;
    sort_order?: number;
}
export interface DocumentSettings {
    requirements: Requirement[];
    requirements_fingerprint: string;
    document_types: { id: string; label: string; is_active?: boolean }[];
}
export default function ProgramDocuments({ programId, settings, canManage }: { programId: string; settings: DocumentSettings; canManage: boolean }) {
    const { slug } = useInventoryContext();
    const [rows, setRows] = useState(settings.requirements);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const update = (index: number, value: Partial<Requirement>) => setRows(rows.map((r, i) => (i === index ? { ...r, ...value } : r)));
    return (
        <form
            className="space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError('');
                try {
                    await axios.put(
                        goodsDistribution.inventory.api.programDocuments.url({ programId }),
                        {
                            requirements_fingerprint: settings.requirements_fingerprint,
                            requirements: rows.map(({ document_type_id, is_required, evidence_mode, physical_copy_requirement }) => ({
                                document_type_id,
                                is_required,
                                evidence_mode,
                                physical_copy_requirement,
                            })),
                        },
                        { headers: { 'X-Municipality-Slug': slug } },
                    );
                    router.reload();
                } catch (failure) {
                    if (axios.isAxiosError(failure)) {
                        const data = failure.response?.data as { message?: string; errors?: Record<string, string[]> };
                        setError(
                            Object.values(data.errors ?? {})
                                .flat()
                                .join(' ') ||
                                data.message ||
                                'Could not save requirements.',
                        );
                    } else setError('Could not save requirements.');
                } finally {
                    setBusy(false);
                }
            }}
        >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ede9] pb-3">
                <h2 className="text-base font-semibold">Program document requirements</h2>
                {canManage && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            setRows([
                                ...rows,
                                { document_type_id: '', is_required: true, evidence_mode: 'physical', physical_copy_requirement: 'unspecified' },
                            ])
                        }
                    >
                        <Plus className="size-4" />
                        Add requirement
                    </Button>
                )}
            </header>
            <Errors errors={error ? { documents: error } : {}} />
            {!rows.length && <p className="py-8 text-sm text-muted-foreground">No document requirements configured.</p>}
            {rows.map((r, index) => (
                <div className="grid items-end gap-3 border-b border-[#e8ede9] pb-4 md:grid-cols-[minmax(0,1fr)_180px_180px_110px_40px]" key={index}>
                    <Field label="Document">
                        <select
                            required
                            disabled={!canManage || busy}
                            className={inputClass}
                            value={r.document_type_id}
                            onChange={(e) => update(index, { document_type_id: e.target.value })}
                        >
                            <option value="">Select document</option>
                            {settings.document_types.map((d) => (
                                <option key={d.id} value={d.id} disabled={d.is_active === false}>
                                    {d.label}
                                    {d.is_active === false ? ' (inactive)' : ''}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Evidence">
                        <select
                            disabled={!canManage || busy}
                            className={inputClass}
                            value={r.evidence_mode}
                            onChange={(e) => update(index, { evidence_mode: e.target.value as Requirement['evidence_mode'] })}
                        >
                            <option value="physical">Physical inspection</option>
                            <option value="upload">Upload</option>
                            <option value="both">Upload and physical</option>
                        </select>
                    </Field>
                    <Field label="Physical copy">
                        <select
                            disabled={!canManage || busy || r.evidence_mode === 'upload'}
                            className={inputClass}
                            value={r.physical_copy_requirement}
                            onChange={(e) => update(index, { physical_copy_requirement: e.target.value })}
                        >
                            {['unspecified', 'original', 'certified_true_copy', 'original_or_certified_true_copy', 'photocopy'].map((v) => (
                                <option key={v} value={v}>
                                    {v.replaceAll('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <label className="flex h-10 items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            disabled={!canManage || busy}
                            checked={r.is_required}
                            onChange={(e) => update(index, { is_required: e.target.checked })}
                        />
                        Required
                    </label>
                    {canManage && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Remove requirement"
                            aria-label="Remove requirement"
                            disabled={busy}
                            onClick={() => setRows(rows.filter((_, i) => i !== index))}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                </div>
            ))}
            {canManage && (
                <>
                    <label className="flex items-start gap-2 text-sm">
                        <input type="checkbox" required />
                        Apply to future requests only; existing request checklists remain unchanged
                    </label>
                    <Button type="submit" disabled={busy} className="bg-[#245e4f] text-white shadow-none">
                        <Save className="size-4" />
                        {busy ? 'Saving' : 'Save requirements'}
                    </Button>
                </>
            )}
        </form>
    );
}
