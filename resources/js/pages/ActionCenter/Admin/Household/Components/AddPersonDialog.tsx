import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link2, UserPlus, Users } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
    canManage: boolean;
    canCorrect: boolean;
    onAddUnregistered: () => void;
    onRegisterBeneficiary: () => void;
    onTransferBeneficiary: () => void;
}

export default function AddPersonDialog({
    open,
    onClose,
    canManage,
    canCorrect,
    onAddUnregistered,
    onRegisterBeneficiary,
    onTransferBeneficiary,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add person</DialogTitle>
                    <DialogDescription>Choose how this person should be recorded in the household.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                    {canManage && (
                        <Choice
                            icon={<Users className="h-5 w-5" />}
                            title="Add unregistered member"
                            description="Add a household roster entry without creating a beneficiary profile."
                            onClick={onAddUnregistered}
                        />
                    )}
                    {canManage && (
                        <Choice
                            icon={<UserPlus className="h-5 w-5" />}
                            title="Register new beneficiary"
                            description="Create a walk-in beneficiary directly in this household."
                            onClick={onRegisterBeneficiary}
                        />
                    )}
                    {canCorrect && (
                        <Choice
                            icon={<Link2 className="h-5 w-5" />}
                            title="Add existing beneficiary"
                            description="Search the registry and complete a reviewed household transfer."
                            onClick={onTransferBeneficiary}
                        />
                    )}
                </div>

                <div className="flex justify-end">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Choice({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex min-h-20 items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-left transition hover:border-slate-400 hover:bg-slate-50"
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">{icon}</span>
            <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
            </span>
        </button>
    );
}
