import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import SearchBar from '@/pages/Utility/SearchBar';
import { Check, ChevronDown, List, PlusIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';

type SortListType = {
    label: string;
    value: string;
};

interface Props {
    className?: string;
    onAddNewButtonClicked: () => void;
    onExportButtonClicked?: () => void;
    onSearch?: (search: string) => void;
    sortList?: SortListType[];
    onSortSelected?: (value: string) => void;
}

export default function Header({ className, onAddNewButtonClicked, onExportButtonClicked, onSearch, sortList = [], onSortSelected }: Props) {
    const [selectedSort, setSelectedSort] = useState<SortListType | null>(sortList[0]);

    const handleSortSelect = (item: SortListType) => {
        if (item === selectedSort) return;
        setSelectedSort(item); // save the selected filter
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

            {/* Export Button */}
            <Button
                onClick={onExportButtonClicked}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100"
            >
                <UploadIcon className="h-4 w-4" />
                Export
            </Button>

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
                <DropdownMenuContent className="w-40">
                    {/* Dropdown Header */}
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500">Sort by</div>
                    {/* Divider */}
                    <div className="border-b border-gray-200" />
                    {sortList.map((item) => (
                        <DropdownMenuItem key={item.value} onClick={() => handleSortSelect(item)} className="flex items-center justify-between">
                            {item.label}
                            {selectedSort?.value === item.value && <Check className="h-4 w-4 text-blue-500" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Add New Button */}
            <Button
                onClick={onAddNewButtonClicked}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100"
            >
                <PlusIcon className="h-4 w-4" />
                Add New
            </Button>
        </div>
    );
}
