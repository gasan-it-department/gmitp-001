import LogInSignUpDialog from '@/pages/Auth/LogInSignUpDialog';
import { useState } from 'react';
import { Button } from './ui/button';

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
            <LogInSignUpDialog isOpen={isLogInSignUpDialogVisible} onClose={() => setLogInSignUpDialogVisible(false)} />
        </div>
    );
}
