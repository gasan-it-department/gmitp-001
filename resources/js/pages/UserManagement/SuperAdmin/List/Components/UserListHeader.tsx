import { MunicipalityDropdown } from '@/components/Shared/MunicipalityDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import superAdmin from '@/routes/superAdmin';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Radix Select rejects empty-string item values — use a sentinel for "Any".
const ANY = '__any__';

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
    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [role, setRole] = useState(filters.role || 'all');
    const [municipality, setMunicipality] = useState(filters.municipality || 'all');
    
    const isMounted = useRef(false);
    
    const hasCriteria = Boolean(search.trim() || (role && role !== 'all') || (municipality && municipality !== 'all'));

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const timeout = setTimeout(() => {
            const query = {
                filter: {
                    search: search.trim() || undefined,
                    role: role === 'all' ? undefined : role,
                    municipality: municipality === 'all' ? undefined : municipality,
                },
                page: 1,
            };

            router.get(superAdmin.users.page.url(), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['users', 'filters'],
            });
        }, 350);
        
        return () => clearTimeout(timeout);
    }, [search, role, municipality]);

    const clearFilters = () => {
        setSearch('');
        setRole('all');
        setMunicipality('all');
        router.get(superAdmin.users.page.url(), {}, { preserveState: false, replace: true });
    };

    return (
        <div className={cn("flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50/60 p-4", className)}>
            {/* Search */}
            <div className="min-w-[240px] flex-1">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Search</label>
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email..."
                        className="h-10 pl-9 bg-white"
                    />
                </div>
            </div>

            {/* Municipality */}
            <div className="min-w-[200px]">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Municipality</label>
                <MunicipalityDropdown value={municipality} onValueChange={setMunicipality} />
            </div>

            {/* Role */}
            <div className="min-w-[160px]">
                <label className="mb-1 block text-[11px] font-semibold tracking-wide text-gray-600 uppercase">Role</label>
                <Select value={role || ANY} onValueChange={(v) => setRole(v === ANY ? 'all' : v)}>
                    <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Municipal Admin</SelectItem>
                        <SelectItem value="client">Client (User)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Clear */}
            {hasCriteria && (
                <Button type="button" variant="ghost" className="h-10 text-xs text-gray-600 hover:text-gray-900" onClick={clearFilters}>
                    <X className="mr-1 h-4 w-4" /> Clear
                </Button>
            )}
        </div>
    );
};
