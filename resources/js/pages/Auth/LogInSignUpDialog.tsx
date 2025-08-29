import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

// Import the LoginForm component
import LoginForm from './Login';
import SignUp from './SignUp';
interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogInSignUpDialog({ isOpen, onClose }: Props) {
    const [dialogTitle, setDialogTitle] = useState('Log in to your account');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={true} className="flex w-full max-w-sm md:max-w-4xl lg:h-[600px]">
                <Tabs
                    defaultValue="login"
                    className="h-full w-full flex-1"
                    onValueChange={(value) => {
                        switch (value) {
                            case 'signup':
                                setDialogTitle('Register new account');
                                break;
                            case 'login':
                                setDialogTitle('Log in to your account');
                                break;
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="p-3 text-center text-[21px]">{dialogTitle}</DialogTitle>
                    </DialogHeader>
                    <TabsList className="flex w-full flex-shrink-0">
                        <TabsTrigger value="login" className="flex-1">
                            Log In
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="flex-1">
                            Sign Up
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex h-full items-center justify-center">
                        <TabsContent value="login" className="px-1">
                            <LoginForm />
                        </TabsContent>

                        <TabsContent value="signup" className="px-1">
                            <SignUp />
                        </TabsContent>
                    </div>
                </Tabs>
                <div className="relative m-1 hidden flex-1 rounded-2xl bg-muted md:block">
                    {/* <img
                        src="/placeholder.svg"
                        alt="Image"
                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    /> */}
                </div>
            </DialogContent>
        </Dialog>
    );
}
