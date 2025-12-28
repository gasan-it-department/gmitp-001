import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import password from '@/routes/password';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import LoginForm from './Login';
import SignUp from './SignUp';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogInSignUpDialog({ isOpen, onClose }: Props) {
    const [activeTab, setActiveTab] = useState('login');

    const titles = {
        login: { title: 'Log In', desc: 'Enter your credentials to access your account.' },
        signup: { title: 'Create account', desc: 'Join us today by filling out the information below.' },
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={true}
                className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-background p-0 sm:h-auto sm:w-full sm:max-w-lg sm:rounded-xl sm:border"
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full w-full flex-col">
                    {/* Header Section */}
                    <div className="shrink-0 px-6 pt-6 pb-2">
                        <DialogHeader className="mb-4 text-left">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                                {titles[activeTab as keyof typeof titles].title}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">{titles[activeTab as keyof typeof titles].desc}</DialogDescription>
                        </DialogHeader>

                        <TabsList className="grid h-11 w-full grid-cols-2 rounded-lg bg-muted/50 p-1">
                            <TabsTrigger
                                value="login"
                                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                Log In
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                Sign Up
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6">
                        <TabsContent value="login" className="mt-0 h-full focus-visible:outline-none">
                            <LoginForm
                                onClose={() => onClose()}
                                onForgotPasswordClick={() => {
                                    // 1. Close the modal first
                                    onClose();
                                    // 2. Visit the dedicated page (ensure 'password.request' is defined in web.php)
                                    router.visit(password.request.url());
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="signup" className="mt-0 h-full focus-visible:outline-none">
                            <SignUp onClose={() => onClose()} />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
