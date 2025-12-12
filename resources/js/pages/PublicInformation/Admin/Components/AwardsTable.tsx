import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AwardsData } from '@/Core/Types/PublicInformation/PublicInformationTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import AwardsHeader from './AwardsHeader';

interface Props {
    data: AwardsData[];
    pagination?: any; // You can pass this later for page links
}

export default function AwardsTable({ data = [] }: Props) {
    // Helper to format money (PHP)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    // Helper to format dates
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Helper for Status Colors
    const getStatusColor = (status: string) => {
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

    return (
        <div className="flex h-full flex-col">
            {/* Header with Create Button */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Procurements</h1>
                <AwardsHeader onSearch={() => {}} />
            </div>

            {/* TABLE CONTAINER */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table className="min-w-full">
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[150px]">Ref No.</TableHead>
                            <TableHead className="w-[300px]">Project Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>ABC (Budget)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Closing Date</TableHead>
                            <TableHead className="w-[120px] text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.length === 0 ? (
                            <AdminEmptyListItem colSpan={7} title="No Procurements Found" message="Create a new record to get started." />
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id} className="group transition-colors hover:bg-gray-50">
                                    {/* 1. Reference Number */}
                                    <TableCell className="font-medium text-gray-900">
                                        {item.reference_number || <span className="text-gray-400 italic">No Ref</span>}
                                    </TableCell>

                                    {/* 2. Title (Truncate if long) */}
                                    <TableCell>
                                        <div className="max-w-[300px] truncate font-medium text-gray-700" title={item.title}>
                                            {item.title}
                                        </div>
                                    </TableCell>

                                    {/* 3. Category */}
                                    <TableCell className="text-gray-500">{item.category}</TableCell>

                                    {/* 4. Budget */}
                                    <TableCell className="font-mono text-gray-700">{formatCurrency(item.approved_budget)}</TableCell>

                                    {/* 5. Status Badge */}
                                    <TableCell>
                                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </TableCell>

                                    {/* 6. Date */}
                                    <TableCell className="text-gray-500">{formatDate(item.closing_date)}</TableCell>

                                    {/* 7. Actions */}
                                    <TableCell>
                                        {/* <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => console.log('Edit', item.id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            {item.files?.length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-600 hover:text-gray-900"
                                                    title="View Files"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Optional: Add Pagination controls at the bottom using `pagination` prop */}
        </div>
    );
}
