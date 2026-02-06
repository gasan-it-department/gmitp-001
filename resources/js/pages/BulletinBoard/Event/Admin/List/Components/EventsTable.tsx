import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EventData } from '@/Core/Types/BulletinBoard/Events';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem'; // Ensure path is correct
import { CheckCircle2, Clock, Pencil, Trash2, XCircle } from 'lucide-react';

interface Props {
    data: EventData[];
    from: number;
    selectedItems: string[];
    onToggleSelect: (id: string) => void;
    onSelectAll: () => void;
    onEdit: (item: EventData) => void;
    onDelete: (id: string) => void;
}

export function EventsTable({ data, from, selectedItems, onToggleSelect, onSelectAll, onEdit, onDelete }: Props) {
    // Helper: Logic from old version
    const getEventStatus = (eventDate: string): string => {
        const today = new Date();
        const event = new Date(eventDate);
        const todayStr = today.toISOString().split('T')[0];
        const eventStr = event.toISOString().split('T')[0];
        if (eventStr === todayStr) return 'Ongoing';
        if (event > today) return 'Upcoming';
        return 'Completed';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Upcoming':
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                        <Clock size={14} /> Upcoming
                    </span>
                );
            case 'Ongoing':
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <CheckCircle2 size={14} /> Ongoing
                    </span>
                );
            case 'Completed':
                return (
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                        <XCircle size={14} /> Completed
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200">
            <Table className="w-full table-auto">
                <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                        <TableHead className="w-12">
                            <div className="flex items-center justify-center p-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer"
                                    checked={selectedItems.length === data.length && data.length > 0}
                                    onChange={onSelectAll}
                                    disabled={data.length === 0}
                                />
                            </div>
                        </TableHead>
                        <TableHead className="w-16 text-center">No.</TableHead>
                        <TableHead>Event Title</TableHead>
                        <TableHead className="w-[350px]">Description</TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.length === 0 ? (
                        <AdminEmptyListItem colSpan={7} title="No Events yet." message="Events you created will appear here." />
                    ) : (
                        data.map((item, index) => {
                            const status = getEventStatus(item.event_date);
                            const rowNumber = from + index; // Use 'from' for correct global numbering

                            return (
                                <TableRow key={item.id} className="transition-colors hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex items-center justify-center p-2">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 cursor-pointer"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => onToggleSelect(item.id)}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{rowNumber}</TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell className="max-w-[350px]">
                                        <div className="line-clamp-3 overflow-hidden text-ellipsis">{item.description}</div>
                                    </TableCell>
                                    <TableCell>{formatDate(item.event_date)}</TableCell>
                                    <TableCell>{getStatusBadge(status)}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                onClick={() => onEdit(item)}
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                                onClick={() => onDelete(item.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
        </div>
        
    );
}
