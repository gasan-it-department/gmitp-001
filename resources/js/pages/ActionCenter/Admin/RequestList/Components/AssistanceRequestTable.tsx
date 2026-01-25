import { ActionCenterForm } from '@/components/ActionCenter/RequestAssistanceBeneficiaryForm';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import type { AssistanceRequest, ActionCenterFormData } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import AdminEmptyListItem from '@/pages/Utility/AdminEmptyListItem';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import PaginationView from '@/pages/Utility/PaginationView';
import ToastProvider from '@/pages/Utility/ToastShower';
import { ToExcel } from '@/pages/Utility/ToExcel';
import Utility from '@/pages/Utility/Utility';
import ActionCenter from '@/routes/actionCenter/admin';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AssistanceRequestDetails from '../../RequestDetails/AssistanceRequestsDetails';
import Header from './Header';
import PrintView from './PrintView';

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

export interface AssistanceApiResponse {
    data: AssistanceRequest[];
    meta: PaginationMeta;
    links: any;
}

interface Props {
    data: AssistanceApiResponse;
    filters?: any;
}

export function AssistanceRequestTable({ data, filters }: Props) {
    const { currentMunicipality } = useMunicipality();

    // --- 1. DATA MAPPING HELPER ---
    // Converts nested AssistanceRequest to flat ActionCenterFormData
    const mapToFormData = (req: AssistanceRequest | null): ActionCenterFormData | null => {
        if (!req) return null;
        return {
            first_name: req.beneficiary?.first_name || '',
            middle_name: req.beneficiary?.middle_name || '',
            last_name: req.beneficiary?.last_name || '',
            suffix: req.beneficiary?.suffix || '',
            birth_date: req.beneficiary?.birth_date || '',
            province: req.beneficiary?.province || '',
            municipality: req.beneficiary?.municipality || '',
            barangay: req.beneficiary?.barangay || '',
            assistance_type: req.assistance_type || '',
            description: req.description || '',
            documents: [],
        };
    };

    // --- 2. STATES ---
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState<{
        isOpen: boolean;
        editData: AssistanceRequest | null;
    }>({
        isOpen: false,
        editData: null,
    });

    const [detailsView, setDetailsView] = useState<{
        data: AssistanceRequest | null;
        isOpen: boolean;
    }>({
        data: null,
        isOpen: false,
    });

    const [printDialogState, setPrintDialogState] = useState<{
        isVisible: boolean;
        request: AssistanceRequest | null;
    }>({ isVisible: false, request: null });

    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: true,
        action: null,
    });

    // --- 3. DATA HELPERS ---
    const requestList = data?.data || [];
    const meta = data?.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 };

    const handlePageChange = (page: number) => {
        const targetUrl = ActionCenter.index.url({ municipality: currentMunicipality.slug });
        router.get(targetUrl, { page: page, ...filters }, { preserveState: true, preserveScroll: true, only: ['requests'] });
    };

    const handleReload = () => {
        router.reload({ only: ['requests'] });
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'in_review': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    if (detailsView.isOpen) {
        return (
            <AssistanceRequestDetails
                data={detailsView.data}
                onBackPressed={() => setDetailsView({ isOpen: false, data: null })}
            />
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Request Records</h1>
                <Header
                    className="flex justify-end"
                    sortList={[
                        { label: 'Name', value: 'first_name' },
                        { label: 'Date', value: 'created_at' },
                        { label: 'Transaction', value: 'transaction_number' },
                        { label: 'Status', value: 'status' },
                    ]}
                    onAddNewButtonClicked={() => setIsAddNewRecordDialogOpen({ isOpen: true, editData: null })}
                    onExportButtonClicked={() => {
                        if (requestList.length === 0) return toast('No data to export');
                        setClassicDialog({
                            isOpen: true,
                            title: 'Export File',
                            message: 'Export list as .xlsx?',
                            positiveButtonText: 'Export',
                            negativeButtonText: 'Cancel',
                            isNegativeButtonHidden: false,
                            action: 'file_export' as any,
                        });
                    }}
                    onSearch={(query) => console.log('Searching:', query)}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
                        <TableRow>
                            <TableHead className="w-16 pl-4 text-xs font-bold text-gray-700">No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Beneficiary</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Date</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Type</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Ref No.</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
                            <TableHead className="text-xs font-bold text-gray-700">Amount</TableHead>
                            <TableHead className="text-center text-xs font-bold text-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {requestList.length === 0 ? (
                            <AdminEmptyListItem colSpan={8} title="No records found." message="Action center records will show here." />
                        ) : (
                            requestList.map((req, index) => {
                                const rowNumber = (meta.current_page - 1) * meta.per_page + (index + 1);
                                return (
                                    <ContextMenu key={req.id}>
                                        <ContextMenuTrigger asChild>
                                            <TableRow className="group transition-colors hover:bg-gray-50">
                                                <TableCell className="pl-4 text-xs text-gray-500">{rowNumber}</TableCell>
                                                <TableCell className="text-xs font-medium text-gray-900 capitalize">
                                                    {req.beneficiary ? `${req.beneficiary.first_name} ${req.beneficiary.last_name}` : <span className="text-gray-400 italic">No Beneficiary</span>}
                                                </TableCell>
                                                <TableCell className="text-xs text-gray-600">{Utility().formatToReadableDateNoTime(req.created_at)}</TableCell>
                                                <TableCell className="text-xs text-gray-600">{req.assistance_type}</TableCell>
                                                <TableCell className="font-mono text-xs text-gray-500">{req.transaction_number}</TableCell>
                                                <TableCell>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getStatusBadgeColor(req.status)}`}>
                                                        {req.status.replace('_', ' ')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs font-semibold text-gray-700">{Utility().formatCurrency(req.amount)}</TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" 
                                                            onClick={() => setDetailsView({ isOpen: true, data: req })}>
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" 
                                                            onClick={() => setIsAddNewRecordDialogOpen({ isOpen: true, editData: req })}>
                                                            <Pencil size={16} />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" 
                                                            disabled={req.status === 'pending'}
                                                            onClick={() => setPrintDialogState({ isVisible: true, request: req })}>
                                                            <Printer size={16} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </ContextMenuTrigger>
                                    </ContextMenu>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4">
                <PaginationView currentPage={meta.current_page} totalPages={meta.last_page} totalItems={meta.total} itemsPerPage={meta.per_page} onPageChange={handlePageChange} />
            </div>

            {/* MODALS */}
            <ActionCenterForm
                isOpen={isAddNewRecordDialogOpen.isOpen}
                onClose={() => setIsAddNewRecordDialogOpen({ isOpen: false, editData: null })}
                onSubmitSuccess={(title, message) => {
                    setClassicDialog({
                        isOpen: true,
                        title,
                        message,
                        positiveButtonText: 'Close',
                        negativeButtonText: '',
                        isNegativeButtonHidden: true,
                        action: null
                    });
                    handleReload();
                }}
                // ✅ This transformation fixes the type error
                editData={mapToFormData(isAddNewRecordDialogOpen.editData)}
            />

            <ClassicDialog
                open={classicDialog.isOpen}
                title={classicDialog.title}
                message={classicDialog.message}
                positiveButtonText={classicDialog.positiveButtonText}
                negativeButtonText={classicDialog.negativeButtonText}
                hideNegativeButton={classicDialog.isNegativeButtonHidden}
                onPositiveClick={() => {
                    if (classicDialog.action === 'file_export') {
                        ToExcel(requestList, `Assistance_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    }
                    setClassicDialog((prev) => ({ ...prev, isOpen: false }));
                }}
                onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isOpen: false }))}
            />

            <PrintView
                isOpen={printDialogState.isVisible}
                onClose={() => setPrintDialogState({ isVisible: false, request: null })}
                data={printDialogState.request}
            />
            
            <ToastProvider />
        </div>
    );
}