import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SearchBar from '@/pages/Utility/SearchBar';
import { List, PlusIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function AnnouncementPageHeader({
    className,
    onAddNewButtonClicked,
    onSearch,
    sortList = [],
    onSortSelected,
}: Props) {
    const [selectedSort, setSelectedSort] = useState<SortListType | null>(null);

    const handleSortSelect = (item: SortListType) => {
        if(selectedSort?.value === item.value) return;
        setSelectedSort(item);
        onSortSelected?.(item.value);
    };

    return (
        <div className={cn('flex flex-row items-center gap-2', className)}>
            {/* Search Bar */}
            <SearchBar
                onSearch={(keyword) => {
                    console.log('Searching for ' + keyword);
                    onSearch?.(keyword);
                }}
                searchBarHint={'Search...'}
            />

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
                        <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                    {sortList.map((item) => (
                        <DropdownMenuItem
                            key={item.value}
                            onClick={() => handleSortSelect(item)}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Add New/Post Button */}
            <Button
                onClick={onAddNewButtonClicked}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100"
            >
                <PlusIcon className="h-4 w-4" />
                Post
            </Button>
        </div>
    );
}
