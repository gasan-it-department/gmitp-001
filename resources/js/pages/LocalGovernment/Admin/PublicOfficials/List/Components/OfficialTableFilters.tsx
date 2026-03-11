// resources/js/Components/Shared/OfficialTableFilters.tsx
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/Core/Hooks/Shared/UseDebounce';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Filters {
    search?: string;
    is_currently_serving?: boolean | string;
    sort_by?: string;
    sort_dir?: string;
    per_page?: number;
}

export function OfficialTableFilters({ filters }: { filters?: Filters }) {
    // 1. Initialize state
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.is_currently_serving ?? 'all');
    const [perPage, setPerPage] = useState(filters?.per_page || 15);
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'last_name');
    const [sortDir, setSortDir] = useState(filters?.sort_dir || 'asc');

    const debouncedSearch = useDebounce(search, 300);
    const isInitialMount = useRef(true);

    // 2. The Master Watcher
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const query: any = {};
        if (debouncedSearch) query.search = debouncedSearch;

        // Strip out the "all" placeholder before sending to Laravel
        if (status !== 'all' && status !== '') query.is_currently_serving = status;

        if (perPage !== 15) query.per_page = perPage;
        if (sortBy !== 'last_name') query.sort_by = sortBy;
        if (sortDir !== 'asc') query.sort_dir = sortDir;

        router.get(window.location.pathname, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, status, perPage, sortBy, sortDir]);

    return (
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
                <Input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pr-10 pl-4 text-slate-900 uppercase ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-slate-500"
                />
            </div>

            {/* Shadcn Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* 1. Status Toggle */}
                <Select value={status.toString()} onValueChange={setStatus}>
                    <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-900">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="1">Active Now</SelectItem>
                            <SelectItem value="0">Historical</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* 2. Sort Toggle */}
                <Select
                    value={`${sortBy}-${sortDir}`}
                    onValueChange={(value) => {
                        const [newSortBy, newSortDir] = value.split('-');
                        setSortBy(newSortBy);
                        setSortDir(newSortDir);
                    }}
                >
                    <SelectTrigger className="w-[160px] bg-white dark:bg-zinc-900">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="last_name-asc">Name (A-Z)</SelectItem>
                            <SelectItem value="last_name-desc">Name (Z-A)</SelectItem>
                            <SelectItem value="created_at-desc">Newly Added</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* 3. Per Page Toggle */}
                <Select
                    // Shadcn requires the value to be a string
                    value={perPage.toString()}
                    // We must parse it back to a number for our React state
                    onValueChange={(value) => setPerPage(Number(value))}
                >
                    <SelectTrigger className="w-[130px] bg-white dark:bg-zinc-900">
                        <SelectValue placeholder="Per Page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="15">15 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
