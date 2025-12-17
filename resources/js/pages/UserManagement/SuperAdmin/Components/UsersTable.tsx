import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/Core/Types/User/UserTypes";
import AdminEmptyListItem from "@/pages/Utility/AdminEmptyListItem";
import Utility from "@/pages/Utility/Utility";
import user from "@/routes/user";

interface Props {
    users: User[];
}

export const UsersTable = ({ users }: Props) => {
    console.log('table:', users);
    const usersList = users;
    return (
        <div>
            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                        <TableRow>
                            <TableHead className="w-16 pl-4 text-xs font-bold text-gray-700">No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Name</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Roles</TableHead>
                            {/* <TableHead className="text-xs font-bold text-gray-700">Type</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Ref No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Amount</TableHead>
                            <TableHead className="text-center text-xs font-bold text-gray-700">Actions</TableHead> */}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {usersList.length === 0 ? (
                            <AdminEmptyListItem colSpan={8} title="No records found." message="Action center records will show here." />
                        ) : (
                            usersList.map((item, index) => {
                               

                                return (
                                    <ContextMenu key={item.id}>
                                        <ContextMenuTrigger asChild>
                                            <TableRow className="group transition-colors hover:bg-gray-50">
                                                {/* <TableCell className="pl-4 text-xs text-gray-500">{rowNumber}</TableCell> */}

                                                {/* <TableCell className="text-xs font-medium text-gray-900 capitalize">
                                                    {req.beneficiary ? (
                                                        `${req.beneficiary.first_name} ${req.beneficiary.last_name}`
                                                    ) : (
                                                        <span className="text-gray-400 italic">No Beneficiary</span>
                                                    )}
                                                </TableCell> */}

                                                <TableCell className="text-xs text-gray-600">
                                                    {(index + 1)}
                                                </TableCell>

                                                <TableCell className="text-xs text-gray-600">
                                                    {item.first_name} {item.last_name}
                                                </TableCell>

                                                {/* <TableCell className="text-xs text-gray-600">
                                                    {item.first_name} {item.last_name}
                                                </TableCell> */}
                                                {/* <TableCell className="text-xs text-gray-600">{req.assistance_type}</TableCell>
                                                <TableCell className="font-mono text-xs text-gray-500">{req.transaction_number}</TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getStatusBadgeColor(req.status)}`}
                                                    >
                                                        {req.status.replace('_', ' ')}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-xs font-semibold text-gray-700">
                                                    {Utility().formatCurrency(req.amount)}
                                                </TableCell> */}

                                                {/* <TableCell>
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                            onClick={() => {
                                                                // handleViewRequest(req.id)
                                                                setDetailsView((prev) => ({
                                                                    ...prev,
                                                                    isOpen: true,
                                                                    data: req
                                                                }));
                                                            }}
                                                        >
                                                            <Eye size={16} />
                                                        </Button>

                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            disabled={req.status === 'pending'}
                                                            className="h-8 w-8 border-green-200 text-green-600 hover:bg-green-50"
                                                            onClick={() => setPrintDialogState({ isVisible: true, request: req })}
                                                        >
                                                            <Printer size={16} />
                                                        </Button>
                                                    </div>
                                                </TableCell> */}
                                            </TableRow>
                                        </ContextMenuTrigger>
                                    </ContextMenu>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
