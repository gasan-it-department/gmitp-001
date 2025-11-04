import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MunicipalityHeader from "./MunicipalityHeader";
import AddEditMunicipalityDialog from "./AddEditMunicipalityDialog";
import { useState } from "react";

export default function MunicipalityPageTable() {
    const [addEditDialog, setAddEditDialog] = useState({
        isOpen: false,

    });
    const dummyData = [
        {
            name: "Gasan",
            zip_code: "123",
            code: "12345",
            region_code: "nothing",
            is_active: true,
            id: "MCMCMCMCMSS"
        },
        {
            name: "Boac",
            zip_code: "4900",
            code: "BOAC01",
            region_code: "REG-MIMAROPA",
            is_active: true,
            id: "BOAC2025A"
        },
        {
            name: "Mogpog",
            zip_code: "4901",
            code: "MOGP02",
            region_code: "REG-MIMAROPA",
            is_active: true,
            id: "MOGP2025B"
        },
        {
            name: "Santa Cruz",
            zip_code: "4902",
            code: "STCR03",
            region_code: "REG-MIMAROPA",
            is_active: false,
            id: "STCR2025C"
        },
        {
            name: "Torrijos",
            zip_code: "4903",
            code: "TORR04",
            region_code: "REG-MIMAROPA",
            is_active: true,
            id: "TORR2025D"
        },
        {
            name: "Buenavista",
            zip_code: "4904",
            code: "BUEN05",
            region_code: "REG-MIMAROPA",
            is_active: true,
            id: "BUEN2025E"
        },
        {
            name: "Buenlag",
            zip_code: "4905",
            code: "BUEN06",
            region_code: "REG-MIMAROPA",
            is_active: false,
            id: "BUEN2025F"
        }
    ];

    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Municipalities</h1>
                <MunicipalityHeader
                    onSearch={() => { }}
                    onFilterButtonClicked={() => {

                    }}
                    onExportButtonClicked={() => {

                    }}
                    onAddNewButtonClicked={() => {
                        setAddEditDialog((prev) => ({
                            ...prev,
                            isOpen: true
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
                            <TableRow
                                key={index}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => {

                                }}
                            >
                                <TableCell className="text-[12px] font-medium">{item.name}</TableCell>
                                <TableCell className="text-[12px] max-w-[300px] line-clamp-2">{item.zip_code}</TableCell>
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
                    isOpen: false
                }));
            } }/>
        </div>
    );
}