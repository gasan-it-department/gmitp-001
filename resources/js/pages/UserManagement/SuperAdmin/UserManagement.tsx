import { User } from '@/Core/Types/User/UserTypes';
import BaseLayout from '@/layouts/App/AppLayout';
import { UsersTable } from './Components/UsersTable';

interface Props {
    users: { data: User[] };
}

export default function UserManagement({ users }: Props) {
    const userList = users.data;
    return (
        <BaseLayout>
            <div className="w-full">
                <UsersTable users={userList} />
            </div>
        </BaseLayout>
    );
}
