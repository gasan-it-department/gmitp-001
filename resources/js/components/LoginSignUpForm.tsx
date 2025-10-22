import LogInSignUpDialog from '@/pages/Auth/LogInSignUpDialog';
import { useState } from 'react';
import { Button } from './ui/button';
import ToastProvider from '@/pages/Utility/ToastShower';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';

export function LogInSignUpForm() {
    const [isLogInSignUpDialogVisible, setLogInSignUpDialogVisible] = useState(false);

    return (
        <div>
            <Button
                onClick={() => {
                    setLogInSignUpDialogVisible(true);
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-1 px-3 font-bold text-white"
            >
                Login
            </Button>
            <ToastProvider />
            <LogInSignUpDialog
                onSignedIn={() => {
                    toast("Account successfully created");
                    window.location.reload();
                }}
                onLoggedIn={(redirectionLink) => {
                    toast("Successfully Logged In");
                    window.location.href = redirectionLink;
                }}
                isOpen={isLogInSignUpDialogVisible}
                onClose={() => setLogInSignUpDialogVisible(false)} />
        </div>
    );
}
