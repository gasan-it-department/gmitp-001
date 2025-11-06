import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AddEditMunicipalityDialog from './AddEditMunicipalityDialog';
import MunicipalityHeader from './MunicipalityHeader';
import { MunicipalityDataType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClassicDialog from '@/pages/Utility/ClassicDialog';

export default function MunicipalityPageTable() {
    const [addEditDialog, setAddEditDialog] = useState({
        isOpen: false,
        editData: null as MunicipalityDataType | null
    });
    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        positiveButtonText: "",
        negativeButtonText: "",
        isNegativeButtonHiddded: false
    });

    const [municipalityList, setMunicipalityList] = useState<MunicipalityDataType[]>([]);

    // ✅ Fetch municipalities once on mount
    useEffect(() => {
        async function fetchMunicipalities() {
            try {
                const response = await axios.get('/super-admin/municipalities-list');
                setMunicipalityList(response.data.data);
                console.log("Reponse: ", municipalityList);
            } catch (error: any) {
                setClassicDialog((prev) => ({
                    ...prev,
                    isOpen: true,
                    title: "Something went wrong!",
                    message:
                        error.response?.data?.message ||
                        error.message ||
                        "An unexpected error occurred while fetching municipalities.",
                    positiveButtonText: "Close",
                    isNegativeButtonHiddded: true
                }));
            }
        }

        fetchMunicipalities();
    }, []);

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Municipalities</h1>
                <MunicipalityHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => { }}
                    onExportButtonClicked={() => { }}
                    onAddNewButtonClicked={() =>
                        setAddEditDialog((prev) => ({
                            ...prev,
                            isOpen: true,
                            editData: null
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
                                <TableRow
                                    key={index}
                                    className="cursor-pointer transition-colors hover:bg-gray-50"
                                    onClick={() => { }}
                                >
                                    <TableCell className="text-[12px] font-medium">{item.name}</TableCell>
                                    <TableCell className="text-[12px] font-medium">{item.zip_code}</TableCell>
                                    {/* <TableCell className="text-[12px] font-medium">{item.municipal_code}</TableCell> */}
                                    <TableCell className="text-[12px] font-medium">
                                        <div className="flex items-center gap-1">
                                            {item.is_active ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span className="text-green-600 font-semibold">Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-red-500 font-semibold">Inactive</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setAddEditDialog((prev) => ({
                                                    ...prev,
                                                    isOpen: true,
                                                    editData: item
                                                }));
                                            }}
                                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                    </TableCell>
                                    {/* <TableCell className="text-[12px]">{item.region_code}</TableCell>
                                    <TableCell className="text-[12px]">{item.status}</TableCell> */}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-[20px] text-gray-500 py-4">
                                    No municipalities found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddEditMunicipalityDialog
                isOpen={addEditDialog.isOpen}
                editData={addEditDialog.editData}
                onClose={() =>
                    setAddEditDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }))
                }
            />

            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={classicDialog.isNegativeButtonHiddded}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                open={classicDialog.isOpen}
                onPositiveClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false
                    }));
                }}
                onNegativeClick={() => {
                    setClassicDialog((prev) => ({
                        ...prev,
                        isOpen: false
                    }));
                }} />
        </div>
    );
}
