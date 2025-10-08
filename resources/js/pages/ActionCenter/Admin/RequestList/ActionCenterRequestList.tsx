//components and layput
import { Beneficiary } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { useState } from 'react';
import { AssistanceRequestTable } from './Components/AssistanceRequestTable';

export default function ActionCenterRequestList() {
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState(false);
    const [isSortSelectionDialogOpen, setIsSortSelectionDialogOpen] = useState(false);
    const [filteringHolder, setFilteringHolder] = useState<any[]>([]);
    const [currentSelectedSortOption, setCurrentSelectedSortOption] = useState('');
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [isClassicDialogShowing, setIsClassicDialogShowing] = useState(false);
    const [editData, setEditData] = useState<Beneficiary | null>(null);

    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <AssistanceRequestTable
                        // onViewDetailsEditButtonClicked={(editData) => {
                        //     // setEditData(editData ?? null);
                        //     setIsAddNewRecordDialogOpen(true);
                        // }}
                        // onViewDetialsDeleteButtonClicked={() => {}}
                        />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
