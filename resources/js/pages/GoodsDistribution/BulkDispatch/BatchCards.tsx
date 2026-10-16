import { quantity } from '../Inventory/components';
import type { BulkAllocation, BulkPreview } from './types';

export default function BatchCards({ rows, issued = false }: { rows: BulkAllocation[] | BulkPreview['allocations']; issued?: boolean }) {
    return <ul aria-label="Stock batches" data-stock-batches className="min-w-0 space-y-3">
        {rows.map((row, index) => <li data-batch-card key={'id' in row ? row.id : `${row.receipt_reference}-${index}`} className="@container/batch min-w-0 rounded-md border border-[#dfe6e1] bg-white p-4">
            <div className="flex min-w-0 flex-col gap-3 @[480px]/batch:flex-row @[480px]/batch:items-start @[480px]/batch:justify-between">
                <h3 className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere]">{row.item_name}</h3>
                <div className="shrink-0 space-y-0.5 @[480px]/batch:text-right"><p className="text-xs text-muted-foreground">{issued && 'status' in row ? (row.status === 'issued' ? 'Issued' : 'Reserved') : 'Quantity'}</p><p data-batch-quantity className="text-sm font-semibold whitespace-nowrap tabular-nums">{quantity(row.quantity)} {row.base_unit}</p></div>
            </div>
            {'additional_issue_id' in row && <p className="mt-1 text-xs text-muted-foreground">{row.additional_issue_id ? 'Additional issue' : 'Original issue'}{'issued_on' in row && row.issued_on ? ` · ${row.issued_on}` : ''}</p>}
            <dl className="mt-4 grid min-w-0 gap-x-6 gap-y-3 border-t border-[#e8ede9] pt-3 @[480px]/batch:grid-cols-2">
                <div className="min-w-0"><dt className="text-xs text-muted-foreground">Receipt reference</dt><dd className="mt-1 font-mono text-xs leading-5 break-all">{row.receipt_reference}</dd></div>
                <div className="min-w-0"><dt className="text-xs text-muted-foreground">Batch reference</dt><dd className="mt-1 text-sm [overflow-wrap:anywhere]">{row.batch_reference ?? 'No batch reference'}</dd></div>
                <div className="min-w-0"><dt className="text-xs text-muted-foreground">Source</dt><dd className="mt-1 text-sm [overflow-wrap:anywhere]">{row.source_name}</dd></div>
                <div className="min-w-0"><dt className="text-xs text-muted-foreground">Expiry</dt><dd className="mt-1 text-sm">{row.expires_on ?? 'No expiry'}</dd></div>
            </dl>
        </li>)}
    </ul>;
}
