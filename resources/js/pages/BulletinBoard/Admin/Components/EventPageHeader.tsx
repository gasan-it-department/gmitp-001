import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import SearchBar from '@/pages/Utility/SearchBar';
import { Check, ChevronDown, List, PlusIcon } from 'lucide-react';
import { useState } from 'react';

type SortListType = {
    label: string;
    value: string;
};

interface Props {
    className?: string;
    onAddNewButtonClicked: () => void;
    onSearch?: (search: string) => void;
    sortList?: SortListType[];
    onSortSelected?: (value: string) => void;
}

export default function EventPageHeader({ className, onAddNewButtonClicked, onSearch, sortList = [], onSortSelected }: Props) {
    const [selectedSort, setSelectedSort] = useState<SortListType | null>(sortList[0] || null);

    const handleSortSelect = (item: SortListType) => {
        setSelectedSort(item);
        onSortSelected?.(item.value);
    };

    return (
        <div className={cn('flex flex-row items-center gap-2', className)}>
            {/* Search */}
            <SearchBar onSearch={(keyword) => onSearch?.(keyword)} searchBarHint="Search..." />

            <div className="ml-2" />

            {/* Sort Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100"
                    >
                        <List className="h-4 w-4" />
                        {selectedSort ? selectedSort.label : 'Sort'}
                        <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-44">
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Sort by</div>

                    {sortList.map((item) => (
                        <DropdownMenuItem key={item.value} onClick={() => handleSortSelect(item)} className="flex items-center justify-between">
                            {item.label}
                            {selectedSort?.value === item.value && <Check className="h-4 w-4 text-primary" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Button */}
            <Button
                onClick={onAddNewButtonClicked}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100"
            >
                <PlusIcon className="h-4 w-4" />
                Create
            </Button>
        </div>
    );
}
