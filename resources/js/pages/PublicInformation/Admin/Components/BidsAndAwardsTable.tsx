import { Button } from "@/components/ui/button";
import BidsAndAwardsHeader from "./BidsAndAwardsHeader";
import { useState } from "react";
import AddEditBidsAndAwardsDialog from "./AddEditBidsAndAwardDialog";
import { BidsAndAwardsFormData } from "@/Core/Types/PublicInformation/PublicInformationTypes";


export default function BidsAndAwardsTable() {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isAddEditDialogVisible, setIsAddEditDialogVisible] = useState(false);

    return (
        <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Bids and Awards</h1>
                <BidsAndAwardsHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => { }}
                    onExportButtonClicked={() => { }}
                    onAddNewButtonClicked={() => { setIsAddEditDialogVisible(true) }}
                />
            </div>

            <div className="flex items-center justify-between mb-2">
                <div>
                    <Button
                        size="sm"
                        disabled={selectedItems.length <= 0}
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                        onClick={() => { }
                            // setClassicDialog((prev) => ({
                            //     ...prev,
                            //     isOpen: true,
                            //     title: "Confirm",
                            //     message: `Are you sure you want to delete ${selectedItems.length} selected announcement(s)?`,
                            //     positiveButtonText: "Delete",
                            //     negativeButtonText: "Cancel",
                            //     payload: selectedItems,
                            // }))
                        }
                    >
                        Delete ({selectedItems.length}) items
                    </Button>
                </div>
            </div>

            <AddEditBidsAndAwardsDialog
                isOpen={isAddEditDialogVisible}
                onClose={() => setIsAddEditDialogVisible(false)}
                onSuccess={(data, isEditMode) => {

                }} />
        </div>
    );
}