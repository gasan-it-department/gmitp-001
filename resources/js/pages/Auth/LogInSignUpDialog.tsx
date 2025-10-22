import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

// Import the LoginForm component
import LoginForm from './Login';
import SignUp from './SignUp';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSignedIn: () => void;
    onLoggedIn: (redirectionLink: string) => void;
}

export default function LogInSignUpDialog({ isOpen, onClose, onSignedIn, onLoggedIn }: Props) {
    const [dialogTitle, setDialogTitle] = useState('Log in to your account');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={true}
                className="flex w-[600px]"
            >
                <Tabs
                    defaultValue="login"
                    className="h-full w-full flex-1"
                    onValueChange={(value) => {
                        switch (value) {
                            case "signup":
                                setDialogTitle("Register new account");
                                break;
                            case "login":
                                setDialogTitle("Log in to your account");
                                break;
                        }
                    }}
                >
                    <DialogHeader className="p-0 mb-3">
                        <DialogTitle className="text-center text-lg font-semibold">
                            {dialogTitle}
                        </DialogTitle>
                    </DialogHeader>

                    <TabsList className="flex w-full mb-3">
                        <TabsTrigger value="login" className="flex-1 text-sm">
                            Log In
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="flex-1 text-sm">
                            Sign Up
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex h-full items-center justify-center">
                        <TabsContent value="login" className="w-full px-2 sm:px-4">
                            <LoginForm
                                onLoggedIn={(redirectionLink) => {
                                    onLoggedIn(redirectionLink);
                                    onClose();
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="signup" className="w-full px-2 sm:px-4">
                            <SignUp
                                onSignedIn={() => {
                                    onSignedIn();
                                    onClose();
                                }}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
