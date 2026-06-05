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
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight">Security Settings</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Protect your account by using a strong password and updating it regularly.
                </p>
            </div>

            <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-6">
                <Card className="p-4 md:p-8 border-border shadow-sm rounded-2xl overflow-hidden">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-border">
                            <div className="p-2 bg-secondary rounded-lg text-primary">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-foreground">Password Credentials</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 max-w-2xl">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="current_password" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Current Password</Label>
                                <div className="relative">
                                    <Input 
                                        id="current_password" 
                                        type="password"
                                        {...register('current_password', { required: true })} 
                                        className="h-11 pl-10 font-medium rounded-xl" 
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            {/* New Passwords */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="new_password" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">New Password</Label>
                                    <Input 
                                        id="new_password" 
                                        type="password"
                                        {...register('new_password', { required: true, minLength: 8 })} 
                                        className="h-11 font-medium rounded-xl" 
                                        placeholder="Min. 8 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Confirm Password</Label>
                                    <Input 
                                        id="confirm_password" 
                                        type="password"
                                        {...register('confirm_password', { required: true })} 
                                        className="h-11 font-medium rounded-xl" 
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl w-full md:w-auto">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center">
                                <Lock className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">Keep your password private.</span>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full md:w-auto h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-bold rounded-xl min-w-[160px]"
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </form>

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
