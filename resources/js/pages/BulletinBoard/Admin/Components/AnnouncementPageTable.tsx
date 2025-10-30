import { ContextMenuTrigger } from "@/components/ui/context-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Header } from "@radix-ui/react-accordion";


export default function AnnouncementPageTable() {
    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Request List</h1>
                
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Title</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Message</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Date Posted</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">ID</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-[75vh] text-center">
                                    <div className="flex items-center justify-center">
                                        <SpinnerCustom />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-gray-500">
                                    Failed to load data. Please try again.
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <p className="text-lg font-medium">No matching requests found</p>
                                        <p className="text-sm text-gray-400">
                                            Try a different search term or clear filters
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map((req, index) => (
                                <ContextMenu key={req.id}>
                                    <ContextMenuTrigger asChild>
                                        <TableRow
                                            onClick={() => setSelectedItem(req)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <TableCell className="text-[12px]">{index + 1}</TableCell>

                                            <TableCell className="text-[12px] capitalize">
                                                {req.beneficiary.first_name} {req.beneficiary.last_name}
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                {Utility().formatToReadableDate(req.created_at)}
                                            </TableCell>

                                            <TableCell className="text-[12px]">{req.assistance_type}</TableCell>

                                            <TableCell className="text-[12px]">{req.transaction_number}</TableCell>

                                            <TableCell className="text-[12px]">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${req.status === 'approved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : req.status === 'rejected'
                                                            ? 'bg-red-100 text-red-700'
                                                            : req.status === 'in_review'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : req.status === 'completed'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    {({
                                                        pending: 'Pending',
                                                        in_review: 'In Review',
                                                        approved: 'Approved',
                                                        rejected: 'Rejected',
                                                        completed: 'Completed',
                                                    }[req.status] || 'Unknown')}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-[12px]">
                                                {Utility().formatAndAddDays(req.created_at, 90)}
                                            </TableCell>
                                        </TableRow>
                                    </ContextMenuTrigger>

                                    <ContextMenuContent className="w-44">
                                        <ContextMenuItem inset onClick={() => setSelectedItem(req)}>
                                            View Details
                                        </ContextMenuItem>
                                        <ContextMenuItem inset onClick={() => setEditingData(req)}>
                                            Edit
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem
                                            inset
                                            onClick={() => handleDeleteRequest(req.id)}
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                        >
                                            Delete
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        )} */}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}