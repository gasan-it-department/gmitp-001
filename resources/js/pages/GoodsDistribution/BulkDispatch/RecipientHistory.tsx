const fields: Record<string, string> = {
    first_name: 'First name', middle_name: 'Middle name', last_name: 'Last name', suffix: 'Suffix',
    barangay: 'Barangay', purok: 'Purok / Sitio', received_on: 'Receipt date',
    collector_name: 'Collector', collector_relationship: 'Collector relationship', paper_reference: 'Paper reference',
    paper_row: 'Paper row', acknowledgement: 'Acknowledgement', remarks: 'Remarks', status: 'Status',
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const valueText = (value: unknown) => value === null || value === undefined || value === '' ? 'Not recorded' : String(value);
const goodsText = (value: unknown) => Array.isArray(value) && value.length ? value.map((entry) => { const line = object(entry); return `${valueText(line.item_name_snapshot)}: ${valueText(line.quantity)} ${valueText(line.base_unit)}`; }).join('; ') : 'Quantities not recorded';

export default function RecipientHistory({ properties }: { properties: Record<string, unknown> }) {
    const afterEvent = object(properties.after);
    const after = object(afterEvent.recipient);
    if (!after.id) return null;
    const before = object(object(properties.before).recipient);
    const changes = Object.entries(fields).filter(([key]) => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null));
    const oldGoods = goodsText(before.lines);
    const newGoods = goodsText(after.lines);
    return <div className="mt-2 space-y-2 text-xs">
        <p className="break-words font-medium">{valueText(after.full_name)}</p>
        {Boolean(afterEvent.reason) && <p className="break-words text-muted-foreground">Reason: {valueText(afterEvent.reason)}</p>}
        {(changes.length > 0 || oldGoods !== newGoods) && <details><summary className="cursor-pointer text-muted-foreground">Recorded changes</summary><dl className="mt-2 space-y-2 border-l border-[#dfe6e1] pl-3">{changes.map(([key, label]) => <div key={key}><dt className="font-medium">{label}</dt><dd className="mt-0.5 break-words text-muted-foreground">{valueText(before[key])} to {valueText(after[key])}</dd></div>)}{oldGoods !== newGoods && <div><dt className="font-medium">Documented goods</dt><dd className="mt-0.5 break-words text-muted-foreground">{oldGoods} to {newGoods}</dd></div>}</dl></details>}
    </div>;
}
