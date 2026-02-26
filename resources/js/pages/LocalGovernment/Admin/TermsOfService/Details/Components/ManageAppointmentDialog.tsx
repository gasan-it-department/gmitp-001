import RemoveOfficialAppointmentController from '@/actions/App/External/Api/Controllers/Government/OfficialTerms/RemoveOfficialAppointmentController';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { AppointmentOverview } from './AppointmentOverview';
import { ConcludeServiceForm } from './ConcludeServiceForm';
import { EditAppointmentForm } from './EditAppointmentForm';

type ManagementView = 'edit' | 'conclude' | 'history' | 'overview';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    appointment: OfficialTerm;
}

export const ManageAppointmentDialog = ({ isOpen, onClose, appointment }: Props) => {
    const [view, setView] = useState<ManagementView>('overview');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentMunicipality } = useMunicipality();
    const handleClose = () => {
        setView('overview');
        onClose();
    };

    const handleRemoveEntry = () => {
        if (!confirm('Are you sure you want to remove this entry? This will permanently delete the record.')) return;

        setIsSubmitting(true);
        router.delete(RemoveOfficialAppointmentController.url(appointment.id), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="min-w-2xl overflow-hidden bg-slate-50 p-0">
                <div className="flex h-[500px]">
                    {/* --- SIDEBAR NAVIGATION --- */}
                    <div className="w-48 space-y-2 border-r border-slate-100 bg-white p-4">
                        <button
                            onClick={() => setView('overview')}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${view === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setView('edit')}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${view === 'edit' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={() => setView('conclude')}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${view === 'conclude' ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            End Service
                        </button>

                        <div className="pt-20">
                            <button
                                onClick={handleRemoveEntry}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                            >
                                Remove Entry
                            </button>
                        </div>
                    </div>

                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="flex flex-1 flex-col">
                        <DialogHeader className="border-b border-slate-100 bg-white p-6">
                            <DialogTitle className="text-lg font-black text-slate-900">{appointment.position?.title} Management</DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6">
                            {view === 'overview' && <AppointmentOverview appointment={appointment} />}
                            {view === 'edit' && <EditAppointmentForm appointment={appointment} />}
                            {view === 'conclude' && <ConcludeServiceForm appointment={appointment} />}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
