import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { CreateOfficialDialog } from '../../../AppointOfficial/Components/CreateOfficialDialog';
import { SearchOfficial } from '../../../AppointOfficial/Components/SearchOfficial';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    position: Position | null;
}

type WorkFlowStep = 'search' | 'create';

export const AppointOfficialDialog = ({ isOpen, onClose, position }: Props) => {
    // 2. Add local state to control the "Inner" dialog
    const [prefillName, setPrefillName] = useState('');
    const [step, setStep] = useState<WorkFlowStep>('search');

    const handleFullClose = () => {
        // setIsCreateOpen(false);
        setStep('search');
        onClose();
    };

    if (!position) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleFullClose}>
            <DialogContent className="sm:max-w-[600px]">
                {/* Increased width slightly for the form */}
                <DialogHeader>
                    <DialogTitle>{step === 'search' ? `Appoint ${position.title}` : 'Create New Official'}</DialogTitle>
                </DialogHeader>
                {step === 'search' ? (
                    <div className="py-4">
                        <SearchOfficial
                            onSelect={(official) => {
                                // Your existing select logic
                                console.log('Selected:', official);
                            }}
                            onCreate={(name) => {
                                setPrefillName(name);
                                setStep('create');
                            }}
                        />
                    </div>
                ) : (
                    <CreateOfficialDialog
                        prefillName={prefillName} // Pass the name they searched for
                        onCancel={(dahilan) => {
                            console.log(dahilan);

                            setStep('search'); // Go back to search if they cancel
                        }}
                        onSuccess={(newOfficial) => {
                            // 1. Log the new official
                            console.log('Newly created official:', newOfficial);

                            // 2. ACTION: Call the same logic you use in SearchOfficial onSelect
                            // handleSelectOfficial(newOfficial);

                            // 3. Close the whole modal
                            onClose();
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};
