import { MunicipalityDropdown } from '@/components/Shared/MunicipalityDropdown';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import SearchBar from '@/pages/Utility/SearchBar';
import superAdmin from '@/routes/superAdmin';
import { router } from '@inertiajs/react';
import { Filter, PlusIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    className?: string;
    filters?: {
        search?: string;
        role?: string;
        municipality?: string;
    };
    // Optional: Pass the list of municipalities from your backend if you have it
    municipalities?: { slug: string; name: string }[];
}

export const UserListHeader = ({ className, filters = {}, municipalities = [] }: Props) => {
    // 1. Initialize state (Visual only for now)
    const [role, setRole] = useState(filters.role || 'all');
    const [municipality, setMunicipality] = useState(filters.municipality || 'all');
    const [search, setSearch] = useState();
    const isMounted = useRef(false);
    const handleAddAdmin = () => {
        router.visit(superAdmin.registry.page.url());
    };

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const query = {
            filter: {
                search: search || undefined,
                role: role === 'all' ? undefined : role,
                municipality: municipality === 'all' ? undefined : municipality,
            },
            page: 1,
        };

        router.get(superAdmin.users.page.url(), query, {
            preserveState: true, // Don't refresh the whole page
            preserveScroll: true, // Don't jump to top
            replace: true, // Clean history
            only: ['users'], // Only reload the table data
        });
    }, [search, role, municipality]);

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {/* SEARCH BAR */}
            <div className="min-w-[200px] flex-1">
                <SearchBar
                    onSearch={(keyword) => {
                        /* Logic to be added later */
                    }}
                    searchBarHint={'Search name, email...'}
                />
            </div>

            {/* MUNICIPALITY FILTER (New) */}
            <div className="w-[180px]">
                <MunicipalityDropdown value={municipality} onValueChange={setMunicipality} />
            </div>

            {/* ROLE FILTER */}
            <div className="w-[160px]">
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-10 border-gray-300 bg-white shadow-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Filter className="h-4 w-4 text-blue-500" />
                            <SelectValue placeholder="All Roles" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Municipal Admin</SelectItem>
                        <SelectItem value="client">Client (User)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="mx-1 hidden h-6 w-px bg-gray-300 sm:block" />

            {/* ACTION BUTTONS */}
            {/* <Button variant="outline" className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100">
                <UploadIcon className="h-4 w-4" />
                Export
            </Button> */}

            <Button
                onClick={handleAddAdmin}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:from-orange-600 hover:to-red-600"
            >
                <PlusIcon className="h-4 w-4" />
                Add New
            </Button>
        </div>
    );
};
