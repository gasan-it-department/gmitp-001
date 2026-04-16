import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { ProcurementListItem } from '@/Core/Types/Procurement/procurement';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import procurement from '@/routes/procurement';
import { Link, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from 'lucide-react';
import { useState } from 'react';
import BidsAndAwardsDialog from '../../../Components/AddEditBidsAndAwardsDialog';

interface Props {
    procurements: ProcurementListItem[];
}

export default function ProcurementTable({ procurements }: Props) {
    const { currentMunicipality } = useMunicipality();

    // 🌟 1. Grab the current filters from the URL so we know what is actively sorted
    const { filters } = usePage<{ filters: any }>().props;

    const [bidsAndAwardsDialogVisible, setBidsAndAwardsDialogVisible] = useState(false);

    // Helpers
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'AWARDED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'OPEN':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'FAILED':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // 🌟 2. THE SORTABLE HEADER COMPONENT
    // We wrap the Inertia <Link> inside your Shadcn <TableHead>
    const SortableHeader = ({ label, field, className }: { label: string; field: string; className?: string }) => {
        const isActive = filters?.sort_field === field;
        const nextDirection = isActive && filters?.sort_direction === 'asc' ? 'desc' : 'asc';

        return (
            <TableHead className={className}>
                <Link
                    // Using your exact route!
                    href={procurement.admin.page.url({ municipality: currentMunicipality.slug })}
                    data={{
                        ...filters, // Keep search, status, etc.
                        sort_field: field,
                        sort_direction: nextDirection,
                    }}
                    preserveScroll
                    preserveState
                    className="group flex w-full items-center gap-1 transition-colors hover:text-indigo-600"
                >
                    {label}
                    {isActive ? (
                        filters.sort_direction === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        )
                    ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-40" />
                    )}
                </Link>
            </TableHead>
        );
    };

    return (
        <div className="flex h-full flex-col">
            {/* TABLE CONTAINER */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table className="min-w-full">
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            {/* Static Header (Not in DTO for sorting yet) */}
                            <TableHead className="w-[180px]">Ref No.</TableHead>

                            {/* 🌟 3. Replace standard TableHeads with our Sortable ones! */}
                            <SortableHeader className="w-[400px]" label="Project Title" field="title" />

                            <TableHead className="w-[180px]">Category</TableHead>

                            <SortableHeader className="w-[180px]" label="ABC (Budget)" field="abc_amount" />

                            <TableHead className="w-[180px]">Status</TableHead>

                            <SortableHeader className="w-[180px]" label="Closing Date" field="closing_date" />

                            <TableHead className="w-[180px] text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {procurements.length === 0 ? (
                            <AdminEmptyListItem colSpan={7} title="No Procurements Found" message="Create a new record to get started." />
                        ) : (
                            procurements.map((item) => (
                                <TableRow key={item.id} className="group transition-colors hover:bg-gray-50">
                                    <TableCell className="font-medium text-gray-900">
                                        {item.reference_number || <span className="text-gray-400 italic">No Ref</span>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[300px] truncate font-medium text-gray-700" title={item.title}>
                                            {item.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500">{item.category}</TableCell>
                                    <TableCell className="font-mono text-gray-700">{formatCurrency(item.abc_amount)}</TableCell>
                                    <TableCell>
                                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-500">{formatDate(item.closing_date)}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <Link
                                                    href={procurement.admin.show.url({
                                                        // FIXED: `.url` added based on standard routing patterns
                                                        municipality: currentMunicipality.slug,
                                                        id: item.id || '',
                                                    })}
                                                >
                                                    {' '}
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <BidsAndAwardsDialog isOpen={bidsAndAwardsDialogVisible} onClose={() => setBidsAndAwardsDialogVisible(false)} onSuccess={() => {}} />
        </div>
    );
}
