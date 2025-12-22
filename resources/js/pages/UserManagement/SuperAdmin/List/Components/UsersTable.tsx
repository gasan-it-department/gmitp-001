import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/Core/Types/User/UserTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import superAdmin from '@/routes/superAdmin';
import { router } from '@inertiajs/react';
import { Eye } from 'lucide-react';

interface Props {
    users: User[];
}

export const UsersTable = ({ users }: Props) => {
    const usersList = users;

    // You can put this in a separate file like `constants/roleStyles.ts`
    // or just at the top of your component file.

    const ROLE_STYLES: Record<string, { label: string; className: string }> = {
        super_admin: {
            label: 'Super Admin',
            className: 'bg-purple-100 text-purple-700 border-purple-200',
        },
        admin: {
            label: 'Admin',
            className: 'bg-blue-100 text-blue-700 border-blue-200',
        },
        client: {
            label: 'Citizen',
            className: 'bg-green-100 text-green-700 border-green-200',
        },
        // Fallback for unknown roles
        default: {
            label: 'Unknown',
            className: 'bg-gray-100 text-gray-700 border-gray-200',
        },
    };

    const handleViewUser = (id: string) => {
        router.visit(superAdmin.show.user.url(id));
    };
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
                            <TableHead className="text-xs font-bold text-gray-700">Phone</TableHead>
                            <TableHead className="text-center text-xs font-bold text-gray-700">Actions</TableHead>
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
                                                <TableCell className="text-xs text-gray-600">{index + 1}</TableCell>

                                                <TableCell className="text-xs text-gray-600">
                                                    {item.first_name} {item.last_name}
                                                </TableCell>

                                                <TableCell className="text-xs text-gray-600">
                                                    {item.roles.map((roleKey) => {
                                                        // Get the style or fallback to default
                                                        const style = ROLE_STYLES[roleKey] || ROLE_STYLES.default;

                                                        return (
                                                            <span
                                                                key={roleKey}
                                                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.className}`}
                                                            >
                                                                {style.label}
                                                            </span>
                                                        );
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-600">{item.phone}</TableCell>
                                                <TableCell className="text-center text-xs text-gray-600">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                        onClick={() => {
                                                            router.visit(superAdmin.show.user.url(item.id));
                                                        }}
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                </TableCell>
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
