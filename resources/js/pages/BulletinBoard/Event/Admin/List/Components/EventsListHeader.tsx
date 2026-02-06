import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    onSearch: (term: string) => void;
    onAdd: () => void;
    selectedCount: number;
}

export function EventsListHeader({ onSearch, onAdd, selectedCount }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch(searchTerm);
        }
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search events..."
                    className="w-full pl-9 sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    onBlur={() => onSearch(searchTerm)} // Optional: search on blur
                />
            </div>

            <div className="flex items-center gap-2">
                {/* Add New Button */}
                <Button
                    onClick={onAdd}
                    className="gap-2 bg-orange-600 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:bg-orange-700 hover:from-orange-600 hover:to-red-600"
                >
                    <Plus size={16} />
                    Add Event
                </Button>
            </div>
        </div>
    );
}
