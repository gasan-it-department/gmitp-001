import { User } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import { PageHeaderTitle } from './Components/PageTitle';
import { UserListHeader } from './Components/UserListHeader';
import { UsersTable } from './Components/UsersTable';

interface Props {
    users: { data: User[] };
}

export default function UserManagement({ users }: Props) {
    const userList: User[] = users.data;
    return (
        <BaseLayout>
            <div className="m-5 mt-0 grid grid-cols-1 bg-white">
                <div className="my-5 flex justify-between">
                    <PageHeaderTitle />
                    <UserListHeader className="flex justify-end" />
                </div>
                <div>
                    <UsersTable users={userList} />
                </div>
            </div>
        </BaseLayout>
    );
}
