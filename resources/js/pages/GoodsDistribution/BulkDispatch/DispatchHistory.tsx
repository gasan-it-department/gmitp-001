import type { BulkChoices } from './types';

const fields: Record<string, string> = {
    requester_name: 'Requester name', requester_role: 'Requester role', custodian_type: 'Custodian type',
    custodian_name: 'Custodian name', custodian_role: 'Custodian role', purpose: 'Purpose', purpose_notes: 'Purpose details',
    destination_barangays: 'Destination barangays', location_notes: 'Venue / Specific location', paper_reference: 'Paper reference',
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export default function DispatchHistory({ properties, choices }: { properties: Record<string, unknown>; choices?: BulkChoices }) {
    const before = object(properties.before);
    const after = object(properties.after);
    const additional = object(after.additional_issue);
    if (additional.id) {
        const old = object(before.additional_issue);
        const lines = Array.isArray(additional.lines_snapshot) ? additional.lines_snapshot.map(object) : [];
        return <div className="mt-2 space-y-1 text-xs">
            <p className="break-words font-medium">{String(additional.reason ?? '')}</p>
            <p className="text-muted-foreground capitalize">{old.status ? `${String(old.status)} to ` : ''}{String(additional.status ?? '')}{additional.actual_issue_on ? ` · Picked up ${String(additional.actual_issue_on)}` : ''}</p>
            <ul className="space-y-1">{lines.map((line, index) => <li key={index} className="break-words">{String(line.item_name_snapshot)}: {String(line.quantity)} {String(line.base_unit)}</li>)}</ul>
            {Boolean(additional.cancellation_reason) && <p className="break-words text-muted-foreground">Cancellation: {String(additional.cancellation_reason)}</p>}
        </div>;
    }
    if (!after.id || after.recipient) return null;
    const changes = Object.entries(fields).filter(([key]) => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null));
    const text = (record: Record<string, unknown>, key: string): string => {
        const value = record[key];
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)) return 'Not recorded';
        if (key === 'purpose' || key === 'custodian_type') {
            const snapshot = object(record.approval_snapshot);
            const saved = snapshot[key === 'purpose' ? 'purpose_label' : 'custodian_type_label'];
            const options = key === 'purpose' ? choices?.purposes : choices?.custodian_types;
            return String(saved ?? options?.find((option) => option.value === value)?.label ?? value);
        }
        return Array.isArray(value) ? value.join(', ') : String(value);
    };
    return changes.length > 0 && <details className="mt-2 text-xs"><summary className="cursor-pointer text-muted-foreground">Dispatch detail changes</summary><dl className="mt-2 space-y-2 border-l border-[#dfe6e1] pl-3">{changes.map(([key, label]) => <div key={key}><dt className="font-medium">{label}</dt><dd className="mt-0.5 break-words text-muted-foreground">{text(before, key)} to {text(after, key)}</dd></div>)}</dl></details>;
}
