import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import Utility from '@/pages/Utility/Utility';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror AssistanceRequestListResource exactly. Re-export so the
// parent page can type its props without duplicating the shape.
// ─────────────────────────────────────────────────────────────────────────────

export interface AssistanceRequestListItem {
    id: string;
    transaction_number: string;
    status: string;

    assistance_type_id: string;
    assistance_type?: {
        id: string;
        name: string;
        slug: string;
    };

    amount_approved: number | null;
    submitted_at: string | null;
    approved_at: string | null;
    released_at: string | null;

    filed_for_self: boolean;
    relationship: { value: string; label: string } | null;
    filer_full_name: string;
    subject_full_name: string;
    is_walkin: boolean;

    snapshot_barangay: string | null;
    snapshot_barangay_psgc_code: string | null;

    beneficiary_id: string;
    household_id: string;

    documents_count?: number;
    documents_uploaded?: string[];

    created_at: string | null;
    updated_at: string | null;
}

export interface PaginatorMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface AssistanceRequestPaginator {
    data: AssistanceRequestListItem[];
    meta: PaginatorMeta;
    links: { first: string | null; last: string | null; prev: string | null; next: string | null };
}

interface Props {
    paginator: AssistanceRequestPaginator;
    /** Callback used by the clickable row and keyboard navigation. */
    onView?: (row: AssistanceRequestListItem) => void;
    /** Real URL retained for standard link behavior in the action column. */
    getViewUrl?: (row: AssistanceRequestListItem) => string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge palette — UI-only mapping. Backend stores the raw string.
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-amber-100  text-amber-800  ring-1 ring-amber-200',
    under_review: 'bg-sky-100    text-sky-800    ring-1 ring-sky-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    released: 'bg-blue-100   text-blue-800   ring-1 ring-blue-200',
    rejected: 'bg-rose-100   text-rose-800   ring-1 ring-rose-200',
    cancelled: 'bg-gray-100   text-gray-700   ring-1 ring-gray-200',
};

export function statusClass(status: string): string {
    return STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
}

export function humanizeStatus(status: string): string {
    return status.replace(/_/g, ' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders rows of assistance requests for the admin queue.
 *
 * Columns are tuned for an MSWD reviewer scanning the inbox:
 *  - Ref no. + Submitted date          → identification + recency
 *  - Subject (with on-behalf hint)     → who would receive the assistance
 *  - Program + Barangay                → eligibility / area filters
 *  - Status + Amount                   → workflow at a glance
 *  - Docs                              → "did they actually attach the required IDs?"
 *  - View                              → open the detail page
 *
 * The component is presentation-only. Filters, pagination, and routing live
 * in the parent page so this table is reusable.
 */
export function AssistanceRequestTable({ paginator, onView, getViewUrl }: Props) {
    const rows = paginator?.data ?? [];
    const meta = paginator?.meta;

    const utils = Utility();

    return (
        <div className="flex h-full flex-col">
            <div className="max-h-[75vh] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
                        <TableRow>
                            <TableHead className="w-16 pl-4 text-xs font-bold text-gray-700">#</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Ref No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Subject</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Program</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Barangay</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Submitted</TableHead>
                            <TableHead className="text-right text-xs font-bold text-gray-700">Amount</TableHead>
                            <TableHead className="text-center text-xs font-bold text-gray-700">Docs</TableHead>
                            <TableHead className="w-16 text-center text-xs font-bold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {rows.length === 0 ? (
                            <AdminEmptyListItem
                                colSpan={10}
                                title="No assistance requests found."
                                message="Filed requests will appear here. Try adjusting filters above."
                            />
                        ) : (
                            rows.map((row, index) => {
                                const rowNumber = meta ? (meta.current_page - 1) * meta.per_page + (index + 1) : index + 1;

                                return (
                                    <TableRow
                                        key={row.id}
                                        role={onView ? 'link' : undefined}
                                        tabIndex={onView ? 0 : undefined}
                                        aria-label={onView ? `View assistance request ${row.transaction_number}` : undefined}
                                        className={
                                            onView
                                                ? 'group cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none focus-visible:ring-inset'
                                                : 'group transition-colors hover:bg-gray-50'
                                        }
                                        onClick={(event) => {
                                            if (!onView || isInteractiveTarget(event.target)) {
                                                return;
                                            }

                                            onView(row);
                                        }}
                                        onKeyDown={(event) => {
                                            if (!onView || isInteractiveTarget(event.target) || (event.key !== 'Enter' && event.key !== ' ')) {
                                                return;
                                            }

                                            event.preventDefault();
                                            onView(row);
                                        }}
                                    >
                                        {/* # */}
                                        <TableCell className="pl-4 text-xs text-gray-500">{rowNumber}</TableCell>

                                        {/* Ref No. */}
                                        <TableCell className="font-mono text-xs font-semibold text-gray-800">{row.transaction_number}</TableCell>

                                        {/* Subject and filer — historical names from the request snapshot */}
                                        <TableCell className="text-xs">
                                            {!row.filed_for_self && (
                                                <div className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">Assistance for:</div>
                                            )}
                                            <div className="font-medium text-gray-900 capitalize">
                                                {row.subject_full_name || <span className="text-gray-400 italic">No name</span>}
                                            </div>
                                            {!row.filed_for_self && row.filer_full_name && (
                                                <div className="mt-0.5 text-[10px] font-medium text-gray-500">Filed by: {row.filer_full_name}</div>
                                            )}
                                            {!row.filed_for_self && row.relationship && (
                                                <div className="mt-0.5 text-[10px] font-medium tracking-wide text-blue-700 uppercase">
                                                    via {row.relationship.label}
                                                </div>
                                            )}
                                            {row.is_walkin && (
                                                <div className="mt-0.5 text-[10px] font-medium tracking-wide text-purple-700 uppercase">walk-in</div>
                                            )}
                                        </TableCell>

                                        {/* Program */}
                                        <TableCell className="text-xs text-gray-700">
                                            {row.assistance_type?.name ?? <span className="text-gray-400 italic">—</span>}
                                        </TableCell>

                                        {/* Barangay */}
                                        <TableCell className="text-xs text-gray-600 capitalize">
                                            {row.snapshot_barangay ?? <span className="text-gray-400 italic">—</span>}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${statusClass(row.status)}`}
                                            >
                                                {humanizeStatus(row.status)}
                                            </span>
                                        </TableCell>

                                        {/* Submitted */}
                                        <TableCell className="text-xs whitespace-nowrap text-gray-600">
                                            {utils.formatToReadableDateNoTime(row.submitted_at ?? undefined)}
                                        </TableCell>

                                        {/* Amount */}
                                        <TableCell className="text-right text-xs font-semibold whitespace-nowrap text-gray-800">
                                            {row.amount_approved !== null ? (
                                                utils.formatCurrency(row.amount_approved)
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </TableCell>

                                        {/* Documents — count badge with collection-key tooltip */}
                                        <TableCell className="text-center">
                                            <DocumentsBadge count={row.documents_count} uploaded={row.documents_uploaded} />
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell>
                                            <div className="flex justify-center">
                                                {getViewUrl ? (
                                                    <Link
                                                        href={getViewUrl(row)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
                                                        aria-label={`View ${row.transaction_number}`}
                                                    >
                                                        <ChevronRight size={17} />
                                                    </Link>
                                                ) : (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                                                        onClick={() => onView?.(row)}
                                                        aria-label={`View ${row.transaction_number}`}
                                                    >
                                                        <ChevronRight size={17} />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Row count caption — small, unobtrusive */}
            {meta && rows.length > 0 && (
                <p className="mt-3 px-1 text-xs text-gray-500">
                    Showing {meta.from}–{meta.to} of {meta.total.toLocaleString()} requests
                </p>
            )}
        </div>
    );
}

function isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest('a, button, input, select, textarea, [role="button"]'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: docs badge
// ─────────────────────────────────────────────────────────────────────────────

function DocumentsBadge({ count, uploaded }: { count: number | undefined; uploaded: string[] | undefined }) {
    // If the parent forgot to eager-load media, the resource omits the field.
    // Render a muted "—" instead of pretending the count is zero.
    if (count === undefined) {
        return <span className="text-xs text-gray-400">—</span>;
    }

    if (count === 0) {
        return <span className="text-xs text-gray-400">0</span>;
    }

    const tooltipBody = uploaded && uploaded.length > 0 ? uploaded.map((key) => key.replace(/_/g, ' ')).join(', ') : 'Files attached';

    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-flex cursor-help items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {count}
                    </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs capitalize">
                    {tooltipBody}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
