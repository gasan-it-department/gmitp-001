import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SearchBar from '@/pages/Utility/SearchBar';
import superAdmin from '@/routes/superAdmin';
import { router } from '@inertiajs/react';
import { List, PlusIcon, UploadIcon } from 'lucide-react';

interface Props {
    className: string;
}

export const UserListHeader = ({ className }: Props) => {
    const handleAddAdmin = () => {
        router.visit(superAdmin.registry.page.url());
    };

    return (
        <div className={cn('flex flex-row items-center gap-2', className)}>
            {/* <h1 className="w-full justify-items-center text-3xl font-extrabold tracking-wide text-balance">Request List</h1> */}
            <SearchBar onSearch={(keyword) => {}} searchBarHint={'Search...'} />

            <div className="ml-2" />

            <Button variant="outline" className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100">
                <UploadIcon className="h-4 w-4" />
                Export
            </Button>

            <Button variant="outline" className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100">
                <List className="h-4 w-4" />
                Sort
            </Button>

            <Button
                onClick={handleAddAdmin}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100"
            >
                <PlusIcon className="h-4 w-4" />
                Add new admin
            </Button>
        </div>
    );
};
