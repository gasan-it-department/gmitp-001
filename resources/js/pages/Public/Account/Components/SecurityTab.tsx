import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import {
    KeyRound,
    Lock,
    Save,
    ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type PasswordFormData = {
    current_password: string;
    new_password: string;
    confirm_password: string;
};

export default function SecurityTab() {
    const { auth } = usePage<SharedData>().props;
    const [isLoading, setIsLoading] = useState(false);

    // Dialogs
    const [classicDialog, setClassicDialog] = useState({
        title: '',
        message: '',
        isOpen: false,
        positiveButtonText: 'Ok',
        negativeButtonText: 'Cancel',
        isNegativeButtonVisible: false,
        currentAction: '',
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordFormData>();

    const onUpdatePassword = async (data: PasswordFormData) => {
        if (data.new_password !== data.confirm_password) {
            alert("New passwords do not match");
            return;
        }

        setIsLoading(true);
        console.log('Updating password...', data);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            reset();
            setClassicDialog({
                title: 'Success',
                message: 'Your password has been updated successfully.',
                isOpen: true,
                positiveButtonText: 'Close',
                negativeButtonText: '',
                isNegativeButtonVisible: false,
                currentAction: 'success'
            });
        }, 1000);
    };

    return (
        // Theme Update: 'bg-muted/30' for main background
        <div className="min-h-screen bg-muted/30">
            <div className="relative mx-auto max-w-3xl px-2 py-4 md:p-8">

                {/* --- PAGE HEADER --- */}
                <div className="mb-4 md:mb-8 px-2 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {/* Icon Badge: 'bg-secondary' & 'text-primary' */}
                            <span className="inline-flex items-center justify-center rounded-lg bg-secondary p-1.5 text-primary shadow-sm border border-border">
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Security
                            </span>
                        </div>
                        {/* Title: 'text-foreground' & 'text-primary' */}
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                            Change <span className="text-primary">Password</span>
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1 md:mt-2 text-sm md:text-base">
                            Update your password to keep your account secure.
                        </p>
                    </div>
                </div>

                {/* --- MAIN CARD --- */}
                {/* Theme Update: 'bg-card', 'border-border' */}
                <Card className="overflow-hidden border border-border shadow-sm rounded-2xl bg-card relative z-10">
                    <div className="p-6 md:p-10">
                        <form onSubmit={handleSubmit(onUpdatePassword)}>
                            <div className="mb-2">
                                {/* Section Header: 'text-foreground', 'border-border' */}
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6 pb-2 border-b border-border">
                                    <KeyRound className="h-5 w-5 text-primary" />
                                    Password Credentials
                                </h3>

                                <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
                                    {/* Current Password */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="current_password" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Current Password</Label>
                                        <div className="relative">
                                            <Input 
                                                id="current_password" 
                                                type="password"
                                                {...register('current_password', { required: true })} 
                                                // Input Theme: 'bg-background', 'border-input', 'text-foreground'
                                                className="h-10 md:h-11 pl-10 bg-background border-input focus-visible:ring-ring font-bold text-foreground" 
                                                placeholder="••••••••"
                                            />
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {/* New Passwords */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="new_password" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">New Password</Label>
                                            <Input 
                                                id="new_password" 
                                                type="password"
                                                {...register('new_password', { required: true, minLength: 8 })} 
                                                className="h-10 md:h-11 bg-background border-input focus-visible:ring-ring font-bold text-foreground" 
                                                placeholder="New password"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="confirm_password" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Confirm Password</Label>
                                            <Input 
                                                id="confirm_password" 
                                                type="password"
                                                {...register('confirm_password', { required: true })} 
                                                className="h-10 md:h-11 bg-background border-input focus-visible:ring-ring font-bold text-foreground" 
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end pt-8 mt-4 border-t border-border">
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        // Button Theme: 'bg-primary', 'text-primary-foreground'
                                        className="h-10 md:h-11 w-full md:w-auto min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-95 font-bold rounded-xl text-sm md:text-base"
                                    >
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                        <Save className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>

            {/* --- CONFIRMATION DIALOG --- */}
            <ClassicDialog
                title={classicDialog.title}
                message={classicDialog.message}
                hideNegativeButton={!classicDialog.isNegativeButtonVisible}
                negativeButtonText={classicDialog.negativeButtonText}
                positiveButtonText={classicDialog.positiveButtonText}
                open={classicDialog.isOpen}
                onNegativeClick={() => setClassicDialog(prev => ({ ...prev, isOpen: false }))}
                onPositiveClick={() => {
                    setClassicDialog(prev => ({ ...prev, isOpen: false }));
                }}
            />
        </div>
    );
}