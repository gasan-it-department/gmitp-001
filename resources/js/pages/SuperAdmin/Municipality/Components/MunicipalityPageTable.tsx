import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { useState } from 'react';
import AddEditMunicipalityDialog from './AddEditMunicipalityDialog';
import MunicipalityHeader from './MunicipalityHeader';

export default function MunicipalityPageTable() {
    const [addEditDialog, setAddEditDialog] = useState({
        isOpen: false,
    });
    const dummyData = [];

    async function fetchMunicipalities() {
        const response = await axios.get(`/super-admin/municipalities-list`);
        // console.log(response.data);
    }
    fetchMunicipalities();
    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Municipalities</h1>
                <MunicipalityHeader
                    onSearch={() => {}}
                    onFilterButtonClicked={() => {}}
                    onExportButtonClicked={() => {}}
                    onAddNewButtonClicked={() => {
                        setAddEditDialog((prev) => ({
                            ...prev,
                            isOpen: true,
                        }));
                    }}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="text-[12px] font-bold">Name</TableHead>
                            <TableHead className="text-[12px] font-bold">Zip Code</TableHead>
                            <TableHead className="text-[12px] font-bold">Code</TableHead>
                            <TableHead className="text-[12px] font-bold">Region Code</TableHead>
                            <TableHead className="text-[12px] font-bold">Status</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {dummyData.map((item, index) => (
                            <TableRow key={index} className="cursor-pointer transition-colors hover:bg-gray-50" onClick={() => {}}>
                                <TableCell className="text-[12px] font-medium">{item.name}</TableCell>
                                <TableCell className="line-clamp-2 max-w-[300px] text-[12px]">{item.zip_code}</TableCell>
                                <TableCell className="text-[12px]">{item.code}</TableCell>
                                <TableCell className="text-[12px]">asdada</TableCell>
                                <TableCell className="text-[12px]">asdada</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AddEditMunicipalityDialog
                isOpen={addEditDialog.isOpen}
                onClose={function (): void {
                    setAddEditDialog((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));
                }}
            />
        </div>
    );
}
