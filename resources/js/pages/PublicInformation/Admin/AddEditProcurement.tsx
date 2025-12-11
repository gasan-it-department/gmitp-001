import AdminLayout from '@/layouts/App/AppLayout';
import { Head } from '@inertiajs/react';
import ProcurementForm, { ProcurementFormData } from './Components/ProcurementForm';

interface Props {
    editData?: ProcurementFormData | null;
}

export default function AddEditProcurementPage({ editData }: Props) {
    return (
        <AdminLayout>
            <Head title={editData ? 'Edit Procurement' : 'New Procurement'} />
            <ProcurementForm editData={editData} />
        </AdminLayout>
    );
}
