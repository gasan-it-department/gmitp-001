import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
    decedents: DecedentListItem[];
}

export const DecedentsTable = ({ decedents }: Props) => {
    return (
        <div>
            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                        <TableRow>
                            <TableHead className="w-16 pl-4 text-xs font-bold text-gray-700 uppercase">No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700 uppercase">Full Name</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700 uppercase">Death Certificate No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700 uppercase">Date of Death</TableHead>
                            <TableHead className="text-center text-xs font-bold text-gray-700 uppercase">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* Empty State Handling */}
                        {decedents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-sm text-gray-500">
                                    No decedent records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            /* Mapping over the data */
                            decedents.map((decedent, index) => (
                                <TableRow key={decedent.id} className="group transition-colors hover:bg-gray-50">
                                    <TableCell className="pl-4 text-xs text-gray-500">
                                        {/* Simple index counter. Will need adjustment if paginated */}
                                        {index + 1}
                                    </TableCell>

                                    <TableCell className="text-sm font-medium text-gray-900">{decedent.full_name}</TableCell>

                                    <TableCell className="font-mono text-xs text-gray-600">{decedent.death_certificate_no}</TableCell>

                                    <TableCell className="text-xs text-gray-600">{decedent.date_of_death}</TableCell>

                                    <TableCell className="text-center text-xs text-gray-600">
                                        {/* Using Inertia Link instead of raw onClick to prevent full page reloads */}
                                        {/* <Link>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                title="View Profile"
                                            >
                                                <Eye size={16} />
                                            </Button>
                                        </Link> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
