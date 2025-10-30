import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/App/AppLayout';
import AddEditAnnouncementDialog from './Components/AddEditAnnouncementDialog';
import { useState } from 'react';
import AnnouncementPageTable from './Components/AnnouncementPageTable';

export default function AnnouncementPage() {
    const [isAnnouncementDialog, setIsAnnouncementDialogShow] = useState(false);

    return (
        <AdminLayout>
            <section className="">
                <div className="m-5 mt-0 flex bg-white">
                    <div className="w-full">
                        <AnnouncementPageTable/>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}