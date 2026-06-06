import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import SuperAdminLayout from '@/layouts/App/AppLayout';
import { Head } from '@inertiajs/react';
import { Building2, CheckCircle2, Pencil, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';
import AddEditMunicipalityDialog from './Components/AddEditMunicipalityDialog';

interface Props {
    municipalities: {
        data: MunicipalityType[];
    };
}

export default function MunicipalityPage({ municipalities }: Props) {
    const [dialog, setDialog] = useState<{ isOpen: boolean; editData: MunicipalityType | null }>({
        isOpen: false,
        editData: null,
    });

    const list = municipalities?.data ?? [];

    const openAdd = () => setDialog({ isOpen: true, editData: null });
    const openEdit = (item: MunicipalityType) => setDialog({ isOpen: true, editData: item });
    const close = () => setDialog((prev) => ({ ...prev, isOpen: false }));

    return (
        <SuperAdminLayout>
            <Head title="Municipalities" />

            <div className="m-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Municipalities</h1>
                        <p className="text-sm text-muted-foreground">Manage tenant municipalities and their active status.</p>
                    </div>

                    <Button onClick={openAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Zip Code</TableHead>
                                <TableHead>Municipal Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                            <Building2 className="h-8 w-8 opacity-40" />
                                            <span>No municipalities yet.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {list.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-sm tabular-nums">{item.zip_code}</TableCell>
                                    <TableCell className="text-sm tabular-nums">{item.municipal_code}</TableCell>
                                    <TableCell>
                                        {item.is_active ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                <XCircle className="mr-1 h-3.5 w-3.5" /> Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(item)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ADD / EDIT DIALOG — keyed so the form re-initialises per target row */}
            <AddEditMunicipalityDialog key={dialog.editData?.id ?? 'new'} isOpen={dialog.isOpen} editData={dialog.editData} onClose={close} />
        </SuperAdminLayout>
    );
}
