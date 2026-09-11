import { Pagination } from '@/components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import superAdmin from '@/routes/superAdmin';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
            links: { url: string | null; label: string; active: boolean }[];
        };
    };
    filters: { filter?: { search?: string; role?: string; municipality?: string } };
    group: 'administrators' | 'citizens';
}

export default function UserManagement({ users, filters, group }: Props) {
    return (
        <BaseLayout>
            <Head title="User Management" />

            <div className="m-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                        <p className="text-sm text-muted-foreground">Manage administrators and users across municipalities.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden text-right text-sm text-muted-foreground sm:block">
                            <span>
                                {users.meta.total ?? 0} {group}
                            </span>
                        </div>
                        {group === 'administrators' && (
                            <Button onClick={() => router.visit(superAdmin.registry.page.url())}>
                                <Plus className="mr-2 h-4 w-4" /> Create Administrator
                            </Button>
                        )}
                    </div>
                </div>

                <Tabs
                    value={group}
                    onValueChange={(value) =>
                        router.get(
                            superAdmin.users.page.url(),
                            { group: value, filter: { ...filters.filter, role: undefined }, page: 1 },
                            { preserveScroll: true },
                        )
                    }
                >
                    <TabsList>
                        <TabsTrigger value="administrators">Administrators</TabsTrigger>
                        <TabsTrigger value="citizens">Citizens</TabsTrigger>
                    </TabsList>
                </Tabs>
                <UserListHeader key={group} filters={filters.filter} group={group} />

                <div className="rounded-lg border bg-white">
                    <UsersTable users={users.data} group={group} />
                </div>

                <div className="mt-4">
                    <Pagination links={users.meta.links} />
                </div>
            </div>
        </BaseLayout>
    );
}
