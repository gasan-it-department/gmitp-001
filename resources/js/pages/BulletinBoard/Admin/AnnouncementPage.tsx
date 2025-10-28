import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/App/AppLayout';
import AddEditAnnouncementDialog from './Components/AddEditAnnouncementDialog';
import { useState } from 'react';

export default function AnnouncementPage() {
    const[isAnnouncementDialog, setIsAnnouncementDialogShow] = useState(false);

    return (
        <AdminLayout>
            <div className='flex flex-row'>
                <AddEditAnnouncementDialog/>
            </div>
        </AdminLayout>
    );
}