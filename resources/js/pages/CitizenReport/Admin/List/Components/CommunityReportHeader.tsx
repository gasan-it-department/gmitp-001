import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SearchBar from '@/pages/Utility/SearchBar';
import { List, UploadIcon, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    onExportButtonClicked?: () => void;
    onSearch?: (search: string) => void;
    sortList?: SortListType[];
    selectedSortValue?: string; // controlled
    onSortSelected?: (value: string) => void;
}

export default function CommunityReportHeader({
    className,
    onExportButtonClicked,
    onSearch,
    sortList = [],
    selectedSortValue,
    onSortSelected,
}: Props) {
    const [selectedSort, setSelectedSort] = useState<SortListType | null>(null);

    // sync selected sort on mount / reload
    useEffect(() => {
        if (!sortList.length) return;

        const found = sortList.find(
            (item) => item.value === selectedSortValue
        );

        setSelectedSort(found || sortList[0]);
    }, [sortList, selectedSortValue]);

    const handleSortSelect = (item: SortListType) => {
        setSelectedSort(item);
        onSortSelected?.(item.value);
    };

    return (
        <div className={cn('flex flex-row items-center gap-2', className)}>
            {/* Search */}
            <SearchBar
                onSearch={(keyword) => onSearch?.(keyword)}
                searchBarHint="Search..."
            />

            <div className="ml-2" />

            {/* Export */}
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
                        {selectedSort?.label ?? 'Sort'}
                        <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-44">
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        Sort by
                    </div>

                    {sortList.map((item) => (
                        <DropdownMenuItem
                            key={item.value}
                            onClick={() => handleSortSelect(item)}
                            className="flex items-center justify-between"
                        >
                            {item.label}
                            {selectedSort?.value === item.value && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
