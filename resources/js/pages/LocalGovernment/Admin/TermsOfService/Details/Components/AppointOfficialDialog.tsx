import AppointOfficialController from '@/actions/App/External/Api/Controllers/Government/OfficialTerms/AppointOfficialController';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { router } from '@inertiajs/react';
import { ArrowLeft, Briefcase, CheckCircle2, User } from 'lucide-react';
import { useState } from 'react';
import { CreateOfficialDialog } from '../../../AppointOfficial/Components/CreateOfficialDialog';
import { SearchOfficial } from '../../../AppointOfficial/Components/SearchOfficial';

// Make sure your Official and Position interfaces are properly imported
interface Props {
    isOpen: boolean;
    onClose: () => void;
    position: Position | null;
    term: Term; // You will need to pass the current term ID to this dialog eventually!
}

type WorkFlowStep = 'search' | 'create' | 'confirm';

export const AppointOfficialDialog = ({ isOpen, onClose, position, term }: Props) => {
    // --- STATE ---
    console.log(term.statutory_start);
    const [step, setStep] = useState<WorkFlowStep>('search');
    const [prefillName, setPrefillName] = useState('');
    const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // NEW: State for the date input
    const [actualStartDate, setActualStartDate] = useState(term?.statutory_start ? term.statutory_start.split('T')[0] : '');

    const { currentMunicipality } = useMunicipality();

    // --- HANDLERS ---
    const handleFullClose = () => {
        setStep('search');
        setSelectedOfficial(null);
        setPrefillName('');
        onClose();
    };

    const handleConfirmAppointment = () => {
        if (!selectedOfficial || !position) return;

        setIsSubmitting(true);

        router.post(
            AppointOfficialController.url(),
            {
                official_id: selectedOfficial.id,
                position_id: position.id,
                term_id: term?.id,
                actual_start_date: actualStartDate, // Send the date to Laravel
            },
            {
                headers: {
                    'X-Municipality-Slug': currentMunicipality.slug,
                },
                onSuccess: () => handleFullClose(),
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    if (!position) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleFullClose}>
            <DialogContent className="flex min-h-[100px] flex-col sm:max-w-[600px]">
                <DialogHeader className="-mx-6 border-b border-slate-100 bg-slate-50/50 px-6 pt-6 pb-4">
                    <DialogTitle className="text-xl font-black text-slate-900">
                        {step === 'search' && `Appoint ${position.title}`}
                        {step === 'create' && 'Create New Official'}
                        {step === 'confirm' && 'Confirm Appointment'}
                    </DialogTitle>
                </DialogHeader>

                {/* --- STEP 1: SEARCH --- */}
                {step === 'search' && (
                    <div className="h-full py-4">
                        <SearchOfficial
                            onSelect={(official) => {
                                setSelectedOfficial(official);
                                setStep('confirm');
                            }}
                            onCreate={(name) => {
                                setPrefillName(name);
                                setStep('create');
                            }}
                        />
                    </div>
                )}

                {/* --- STEP 2: CREATE --- */}
                {step === 'create' && (
                    <CreateOfficialDialog
                        prefillName={prefillName}
                        onCancel={() => setStep('search')}
                        onSuccess={(newOfficial) => {
                            setSelectedOfficial(newOfficial);
                            setStep('confirm');
                        }}
                    />
                )}

                {/* --- STEP 3: CONFIRM --- */}
                {step === 'confirm' && selectedOfficial && (
                    <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                {/* Official Avatar */}
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow-md">
                                    {selectedOfficial.profile_url ? (
                                        <img src={selectedOfficial.profile_url} alt="Profile" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <User className="h-8 w-8" />
                                    )}
                                </div>

                                {/* Official Details */}
                                <h3 className="text-xl font-black text-slate-900">{selectedOfficial.formatted_name}</h3>
                                <p className="text-sm font-medium text-slate-500">{selectedOfficial.municipality || 'Registered Official'}</p>

                                {/* The Assignment Badge */}
                                <div className="my-5 flex items-center justify-center gap-3">
                                    <div className="h-px w-12 bg-slate-200"></div>
                                    <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        Assigning To
                                    </div>
                                    <div className="h-px w-12 bg-slate-200"></div>
                                </div>

                                {/* Position Badge */}
                                <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-orange-700">
                                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                                    <span className="font-bold">{position.title}</span>
                                </div>
                            </div>
                        </div>

                        {/* Date Picker Input Section */}
                        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/30 p-4">
                            <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Effective Start Date</label>
                            <input
                                type="date"
                                value={actualStartDate}
                                onChange={(e) => setActualStartDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition-all outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5"
                            />
                            <p className="text-[10px] text-slate-400 italic">
                                * This sets the official date the person assumes the role for this term.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                            <button
                                onClick={() => setStep('search')}
                                disabled={isSubmitting}
                                className="group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Change Person
                            </button>

                            <button
                                onClick={handleConfirmAppointment}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-70"
                            >
                                {isSubmitting ? 'Appointing...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
