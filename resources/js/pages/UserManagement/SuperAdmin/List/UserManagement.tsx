import { Pagination } from '@/components/Shared/Pagination';
import { User } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import { PageHeaderTitle } from './Components/PageTitle';
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
            <div className="m-5 mt-0 grid grid-cols-1 bg-white">
                <div className="my-5 flex justify-between">
                    <PageHeaderTitle />
                    <UserListHeader filters={filters.filter} className="flex justify-end" />
                </div>

                <div>
                    {/* 1. Pass data to table */}
                    <UsersTable users={users.data} />

                    {/* 2. ADD PAGINATION HERE */}
                    <div className="mt-4">
                        <Pagination links={users.meta.links} />{' '}
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
}
