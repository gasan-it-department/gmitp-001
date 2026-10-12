import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import { Save, Upload } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, StateBadge, useInventoryContext, useInventoryMutation } from '../Inventory/components';
import type { DocumentCheck, GoodsRequest, Permissions } from './types';

export default function DocumentReview({
    document: d,
    request: r,
    permissions,
}: {
    document: DocumentCheck;
    request: GoodsRequest;
    permissions: Permissions;
}) {
    const mutation = useInventoryMutation();
    const { slug } = useInventoryContext();
    const api = goodsDistribution.requests.api;
    const [status, setStatus] = useState(d.status);
    const [copy, setCopy] = useState(d.presented_copy_type ?? '');
    const [remarks, setRemarks] = useState(d.remarks ?? '');
    const [file, setFile] = useState<File | null>(null);
    const unlocked = ['pending', 'returned', 'under_review'].includes(r.status);
    return (
        <section className="space-y-4 border-b border-[#e8ede9] pb-5">
            <header className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-medium">
                    {d.label} <span className="text-xs text-muted-foreground">{d.is_required ? 'Required' : 'Optional'}</span>
                </h2>
                <StateBadge value={d.status} />
            </header>
            <p className="text-xs text-muted-foreground">
                {d.evidence_mode === 'both'
                    ? 'Upload and physical inspection'
                    : d.evidence_mode === 'upload'
                      ? 'Uploaded evidence'
                      : 'Physical inspection'}{' '}
                · {d.physical_copy_requirement.replaceAll('_', ' ')}
            </p>
            {d.current_media_id && (
                <a
                    className="text-sm text-[#245e4f] underline"
                    href={goodsDistribution.requests.document.url({ municipality: slug, requestId: r.id, checkId: d.id })}
                >
                    View uploaded evidence
                </a>
            )}
            <Errors errors={mutation.errors} />
            {unlocked && d.evidence_mode !== 'physical' && (permissions.intake || permissions.process) && (
                <form
                    className="flex flex-wrap items-end gap-3"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!file) return;
                        const data = new FormData();
                        data.set('version', String(r.version));
                        data.set('file', file);
                        const result = await mutation.submit(api.upload.url({ requestId: r.id, checkId: d.id }), data);
                        if (result) router.reload();
                    }}
                >
                    <Field label="PDF or image">
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    </Field>
                    <Button variant="outline" type="submit" disabled={mutation.busy || !file}>
                        <Upload className="size-4" />
                        {d.current_media_id ? 'Replace evidence' : 'Upload evidence'}
                    </Button>
                </form>
            )}
            {permissions.process && r.status === 'under_review' ? (
                <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const result = await mutation.submit(
                            api.check.url({ requestId: r.id, checkId: d.id }),
                            { version: r.version, status, presented_copy_type: copy || null, remarks },
                            'patch',
                        );
                        if (result) router.reload();
                    }}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Inspection result">
                            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as DocumentCheck['status'])}>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Needs correction</option>
                            </select>
                        </Field>
                        {d.evidence_mode !== 'upload' && (
                            <Field label="Physical copy presented">
                                <select className={inputClass} value={copy} onChange={(e) => setCopy(e.target.value)}>
                                    <option value="">Select copy type</option>
                                    <option value="original">Original</option>
                                    <option value="certified_true_copy">Certified true copy</option>
                                    <option value="photocopy">Photocopy</option>
                                </select>
                            </Field>
                        )}
                    </div>
                    <Field label="Inspection remarks">
                        <textarea
                            className={`${inputClass} h-20 py-2`}
                            value={remarks}
                            required={status === 'rejected'}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </Field>
                    <Button variant="outline" type="submit" disabled={mutation.busy}>
                        <Save className="size-4" />
                        Save inspection
                    </Button>
                </form>
            ) : (
                <div className="text-sm text-muted-foreground">
                    {d.presented_copy_type && <p>{d.presented_copy_type.replaceAll('_', ' ')}</p>}
                    {d.remarks && <p>{d.remarks}</p>}
                    {d.checked_at && <p>Inspected {new Date(d.checked_at).toLocaleString()}</p>}
                </div>
            )}
        </section>
    );
}
