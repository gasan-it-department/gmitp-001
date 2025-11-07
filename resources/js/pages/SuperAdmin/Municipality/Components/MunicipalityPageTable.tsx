import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import axios from 'axios';
import { CheckCircle2, Pencil, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddEditMunicipalityDialog from './AddEditMunicipalityDialog';
import MunicipalityHeader from './MunicipalityHeader';

export default function MunicipalityPageTable() {
    const [addEditDialog, setAddEditDialog] = useState({
        isOpen: false,
        editData: null as MunicipalityType | null,
    });
    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHiddded: false,
    });

    const [municipalityList, setMunicipalityList] = useState<MunicipalityType[]>([]);

    const fetchMunicipalities = async () => {
        try {
            const response = await axios.get('/municipality/super-admin/list');
            setMunicipalityList(response.data.data);
            console.log(response.data.data);
        } catch (error: any) {
            setClassicDialog((prev) => ({
                ...prev,
                isOpen: true,
                title: 'Something went wrong!',
                message: error.response?.data?.message || error.message || 'An unexpected error occurred while fetching municipalities.',
                positiveButtonText: 'Close',
                isNegativeButtonHiddded: true,
            }));
        }
    };

    // Fetch once on mount
    useEffect(() => {
        fetchMunicipalities();
    }, []);

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Municipalities</h1>
                <MunicipalityHeader
                    onSearch={() => {}}
                    onFilterButtonClicked={() => {}}
                    onExportButtonClicked={() => {}}
                    onAddNewButtonClicked={() =>
                        setAddEditDialog((prev) => ({
                            ...prev,
                            isOpen: true,
                            editData: null,
                        }))
                    }
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">Name</TableHead>
                            <TableHead className="text-[12px] font-bold">Zip Code</TableHead>
                            <TableHead className="text-[12px] font-bold">Status</TableHead>
                            <TableHead className="text-[12px] font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {municipalityList.length > 0 ? (
                            municipalityList.map((item, index) => (
                                <TableRow key={index} className="cursor-pointer transition-colors hover:bg-gray-50">
                                    <TableCell className="text-[12px] font-medium">{item.name}</TableCell>
                                    <TableCell className="text-[12px] font-medium">{item.zip_code}</TableCell>
                                    <TableCell className="text-[12px] font-medium">
                                        <div className="flex items-center gap-1">
                                            {item.is_active ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span className="font-semibold text-green-600">Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                    <span className="font-semibold text-red-500">Inactive</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setAddEditDialog({
                                                    isOpen: true,
                                                    editData: item,
                                                });
                                            }}
                                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="py-4 text-center text-[14px] text-gray-500">
                                    No municipalities found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ADD/EDIT DIALOG */}
            <AddEditMunicipalityDialog
                isOpen={addEditDialog.isOpen}
                editData={addEditDialog.editData}
                onClose={() =>
                    setAddEditDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }))
                }
                onSuccess={(newData, isEdit) => {
                    if (isEdit) {
                        setMunicipalityList((prev) => prev.map((item) => (item.id === newData.id ? newData : item)));
                        console.log('Selected id: ' + newData.id);
                    } else {
                        // ✅ Add new item at top
                        setMunicipalityList((prev) => [newData, ...prev]);
                    }
                    setAddEditDialog((prev) => ({ ...prev, isOpen: false }));
                }}
            />

            {/* CLASSIC DIALOG */}
            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHiddded}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                open={classicDialog.isOpen}
                onPositiveClick={() => setClassicDialog({ ...classicDialog, isOpen: false })}
                onNegativeClick={() => setClassicDialog({ ...classicDialog, isOpen: false })}
            />
        </div>
    );
}
