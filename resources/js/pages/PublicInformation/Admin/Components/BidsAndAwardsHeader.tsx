import { Button } from '@/components/ui/button';
import { useMunicipality } from '@/Core/Context/MunicipalityContext'; // Import the hook
import { cn } from '@/lib/utils';
import SearchBar from '@/pages/Utility/SearchBar';
import { List, PlusIcon } from 'lucide-react';

interface Props {
    className?: string;
    onFilterButtonClicked?: () => void;
    onSearch?: (search: string) => void;
    onCreateNewButtonClicked: () => void;
}

export default function BidsAndAwardsHeader({ className, onFilterButtonClicked, onSearch, onCreateNewButtonClicked }: Props) {
    // 1. Consuming the context here is the clean, correct way
    const { currentMunicipality } = useMunicipality();
    const handleCreateClick = () => {
        onCreateNewButtonClicked();
        if (!currentMunicipality?.slug) return;
        // onCreateNewButtonClicked();

        // router.visit(awardsAdminPage.addEditPage.url(currentMunicipality.slug));
    };

    return (
        <div className={cn('flex flex-row items-center gap-2', className)}>
            <SearchBar
                onSearch={(keyword) => {
                    console.log('Searching for ' + keyword);
                    onSearch?.(keyword);
                }}
                searchBarHint={'Search...'}
            />

            <div className="ml-2" />

            <Button
                onClick={onFilterButtonClicked}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100"
            >
                <List className="h-4 w-4" />
                Sort
            </Button>

            <Button
                // 4. FIX: Must use an arrow function here, otherwise it visits immediately on render
                onClick={handleCreateClick}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-100"
            >
                <PlusIcon className="h-4 w-4" />
                Create
            </Button>
        </div>
    );
}
