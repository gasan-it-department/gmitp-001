import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SearchBar from '@/pages/Utility/SearchBar';
import { Filter, PlusIcon, UploadIcon } from 'lucide-react';

interface Props {
    className?: string;
    onAddNewButtonClicked: () => void;
}

export default function MunicipalityHeader({ className, onAddNewButtonClicked }: Props) {
    return (
        <div className={cn('flex flex-row items-center gap-2', className)}>
            {/* <h1 className="w-full justify-items-center text-3xl font-extrabold tracking-wide text-balance">Request List</h1> */}
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
