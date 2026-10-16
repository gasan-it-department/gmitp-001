import { quantity } from '../Inventory/components';
import type { Snapshot } from './types';

function summaries(value: unknown): [string, string][] {
    if (!value || typeof value !== 'object') return [];
    const data = value as Record<string, unknown>;
    const result: [string, string][] = [];
    const labels: Record<string, string> = {
        status: 'Status',
        version: 'Version',
        reason: 'Reason',
        notes: 'Notes',
        document: 'Document',
        presented_copy_type: 'Presented copy',
        remarks: 'Remarks',
        acknowledgement_reference: 'Acknowledgement',
        storage_name: 'Storage',
    };
    Object.entries(labels).forEach(([key, label]) => {
        if (data[key] != null) result.push([label, String(data[key]).replaceAll('_', ' ')]);
    });
    if (data.snapshot && typeof data.snapshot === 'object') {
        const snapshot = data.snapshot as Partial<Snapshot>;
        if (snapshot.filer) result.push(['Filer', snapshot.filer.name]);
        if (snapshot.subject) result.push(['Recipient', snapshot.subject.name]);
        if (snapshot.household_code) result.push(['Household', snapshot.household_code]);
        result.push(['Address', [snapshot.street, snapshot.barangay].filter(Boolean).join(', ') || 'Not recorded']);
        if (snapshot.roster)
            result.push([
                'Household members',
                snapshot.roster
                    .map(
                        (member) =>
                            `${member.name} (${member.relationship?.replaceAll('_', ' ') || 'Not recorded'}; ${member.birth_date || 'No birth date'}; ${member.beneficiary_id ? 'linked' : 'unlinked'})`,
                    )
                    .join('; '),
            ]);
    }
    if ('document_checks_reset' in data) result.push(['Document inspections reset', data.document_checks_reset ? 'Yes' : 'No']);
    if (Array.isArray(data.document_checks))
        result.push(['Document inspections', data.document_checks.map((check) => check.status).join(', ') || 'None']);
    if (Array.isArray(data.lines)) {
        result.push([
            'Goods',
            data.lines
                .map(
                    (line) =>
                        `${line.item_name_snapshot}: ${line.quantity == null ? 'Quantity not set' : `${quantity(String(line.quantity))} ${line.base_unit}`}`,
                )
                .join('; ') || 'None',
        ]);
    }
    if (Array.isArray(data.allocations)) {
        result.push([
            'Allocations',
            data.allocations.length
                ? data.allocations
                      .map((allocation) => `${quantity(String(allocation.quantity))} ${allocation.base_unit} (${allocation.status})`)
                      .join('; ')
                : 'None',
        ]);
    }
    if ('current_media_id' in data) result.push(['Evidence', data.current_media_id ? 'Uploaded file recorded' : 'No uploaded file']);
    if (data.cooldown_policy && typeof data.cooldown_policy === 'object') {
        const policy = data.cooldown_policy as Record<string, unknown>;
        result.push([
            'Cooldown policy',
            policy.enabled ? `${policy.duration} ${policy.unit} per ${policy.scope}; next eligible ${policy.ends_on}` : 'Disabled at handover',
        ]);
    }
    if (data.cooldown_exception_authorization && typeof data.cooldown_exception_authorization === 'object') {
        const authorization = data.cooldown_exception_authorization as Record<string, unknown>;
        result.push(['Cooldown exception', String(authorization.reason)], ['Exception handover date', String(authorization.date)]);
        if (Array.isArray(authorization.sources))
            result.push(['Reviewed cooldown sources', authorization.sources.map((source) => source.reference).join(', ')]);
    } else if ('cooldown_exception_authorization' in data) {
        result.push(['Cooldown exception', 'None']);
    }
    if ('inspected_media_id' in data) result.push(['File inspection', data.inspected_media_id ? 'Current file inspected' : 'Not confirmed']);
    return result;
}

export default function HistoryChanges({ properties }: { properties: Record<string, unknown> }) {
    const sections = [
        ['Before', summaries(properties.before)],
        ['After', summaries(properties.after)],
    ] as const;
    return (
        <div className="mt-3 grid gap-4 rounded-md border border-[#e8ede9] p-3 sm:grid-cols-2">
            {sections.map(([title, rows]) => (
                <section key={title} className="min-w-0">
                    <h3 className="mb-2 text-xs font-semibold text-muted-foreground">{title}</h3>
                    <dl className="space-y-2 text-xs">
                        {rows.map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="mt-0.5 break-words">{value}</dd>
                            </div>
                        ))}
                        {!rows.length && <p className="text-muted-foreground">No earlier values</p>}
                    </dl>
                </section>
            ))}
        </div>
    );
}
