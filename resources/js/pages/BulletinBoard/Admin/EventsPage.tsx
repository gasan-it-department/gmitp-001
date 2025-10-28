import AdminLayout from '@/layouts/App/AppLayout';
import AddEditEventsDialog from './Components/AddEditEventsDialog';

export default function(){
    return(
        <AdminLayout>
            <div className='flex flex-row'>
                <AddEditEventsDialog/>
            </div>
        </AdminLayout>
    );
}