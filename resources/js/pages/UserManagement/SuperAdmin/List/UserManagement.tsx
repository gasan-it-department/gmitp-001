import { Pagination } from '@/components/Shared/Pagination';
import { User } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import { Head } from '@inertiajs/react';
import { UserListHeader } from './Components/UserListHeader';
import { UsersTable } from './Components/UsersTable';

interface Props {
    users: {
        data: User[];
        // The root 'links' is actually an object (first, last, prev, next)
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            total: number;
            to: number;
            links: any[];
        };
    };
    filters: any;
}

export default function UserManagement({ users, filters }: Props) {
    return (
        <BaseLayout>
            <Head title="User Management" />

            <div className="m-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                        <p className="text-sm text-muted-foreground">Manage administrators and users across municipalities.</p>
                    </div>

                    <UserListHeader filters={filters.filter} className="flex justify-end" />
                </div>

                <div className="rounded-lg border bg-white">
                    <UsersTable users={users.data} />
                </div>

                <div className="mt-4">
                    <Pagination links={users.meta.links} />
                </div>
            </div>
        </BaseLayout>
    );
}
