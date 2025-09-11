import { Button } from "@/components/ui/button";
import SearchBar from "@/pages/Utility/SearchBar";
import { Filter, PlusIcon, UploadIcon } from "lucide-react";

interface Props{
    activeItem: string;
    onFilterButtonClicked: () => void;
    onAddNewButtonClicked: () => void;
    onExportButtonClicked: () => void;
    onSearch: (search: string) => void;
}


export default function Header( { activeItem, onFilterButtonClicked, onAddNewButtonClicked, onExportButtonClicked, onSearch}: Props) {
    return (
        <div className="flex flex-row items-center gap-2">
            <SearchBar onSearch={(e) => {
                onSearch(e);
            }} searchBarHint={'Search...'} />

            <div className='ml-2' />

            <Button
                onClick={() => {
                    onExportButtonClicked();
                }}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 shadow-sm text-gray-700 hover:bg-gray-100"
            >
                <UploadIcon className="w-4 h-4" />
                Export
            </Button>

            <Button
                onClick={() => {
                    onFilterButtonClicked();
                }}
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-gray-300 shadow-sm text-gray-700 hover:bg-gray-100"
            >
                <Filter className="w-4 h-4" />
                Filter
            </Button>

            {
                activeItem === "Dashboard" && (
                    <Button
                        onClick={() => {
                            onAddNewButtonClicked();
                        }}
                        variant="outline"
                        className="flex items-center gap-2 rounded-lg border-gray-300 shadow-sm text-gray-700 hover:bg-gray-100"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add New
                    </Button>
                )
            }

        </div>
    );
}