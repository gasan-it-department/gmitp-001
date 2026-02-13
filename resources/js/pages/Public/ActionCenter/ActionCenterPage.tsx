import { ActionCenterForm } from '@/components/ActionCenter/RequestAssistanceBeneficiaryForm';
import { LogInSignUpForm } from '@/components/LoginSignUpForm';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PublicLayout from '@/layouts/Public/PublicLayout';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Heart, HandHeart, ShieldCheck, Ambulance, Wallet, Baby, Bus, Users } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
    const { auth } = usePage<SharedData>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [classicDialog, setClassicDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        positiveButtonText: string;
        negativeButtonText: string;
        isNegativeButtonHidden: boolean;
        action: string | null;
    }>({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
        action: null,
    });

    return (
        <PublicLayout title="Action Center" description="Social Welfare Services">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-muted/30 px-4 py-16 md:py-24">
                {/* Optional: Subtle Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                <div className="relative mx-auto max-w-4xl space-y-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary shadow-sm">
                        <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
                        Community Support Services
                    </div>

                    <h2 className="text-4xl leading-tight font-black text-foreground md:text-5xl lg:text-6xl tracking-tight uppercase">
                        We're Here to Help <br className="hidden sm:block" />
                        <span className="text-primary">Our Community</span>
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl font-medium">
                        The Municipal Action Center provides essential assistance to residents in need. Whether you need food, medical, financial, or
                        other support, we're here for you.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                        {auth.user ? (
                            <>
                                <Button
                                    size="lg"
                                    className="h-14 bg-primary px-8 text-base font-black uppercase tracking-widest text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    <HandHeart className="mr-2 h-5 w-5" />
                                    Request Assistance
                                </Button>

                                {/* The Dialog */}
                                <ActionCenterForm
                                    onSubmitSuccess={(title, message) => {
                                        setClassicDialog((prev) => ({
                                            ...prev,
                                            isOpen: true,
                                            title: title,
                                            message: message,
                                            positiveButtonText: 'Close',
                                            isNegativeButtonHidden: true,
                                        }));
                                    }}
                                    isOpen={isDialogOpen}
                                    onClose={() => setIsDialogOpen(false)} 
                                    editData={null}                                    
                                />
                            </>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full sm:w-auto">
                                            {/* Wrapped in div to ensure tooltip works */}
                                            <div className="rounded-xl border border-border bg-background p-1 shadow-sm">
                                                 <LogInSignUpForm />
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-foreground text-background font-bold">
                                        <p>Please login before requesting for Assistance</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-widest text-foreground md:text-3xl">
                            Assistance Programs
                        </h3>
                        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Food Assistance',
                                icon: ShieldCheck, // Using Lucide icons instead of emojis for professional look
                                description: 'Access to nutritious meals and food supplies for families in need.',
                            },
                            {
                                title: 'Medical Assistance',
                                icon: Ambulance,
                                description: 'Support for medical expenses, prescriptions, and healthcare needs.',
                            },
                            {
                                title: 'Financial Assistance',
                                icon: Wallet,
                                description: 'Emergency financial aid for utilities, rent, and essential expenses.',
                            },
                            { 
                                title: 'Burial Assistance', 
                                icon: HandHeart, 
                                description: 'Compassionate support for funeral and burial expenses.' 
                            },
                            {
                                title: 'Transportation',
                                icon: Bus,
                                description: 'Help with transportation for medical appointments and essential travel.',
                            },
                            {
                                title: 'Community Resources',
                                icon: Users,
                                description: 'Connections to additional local services and support programs.',
                            },
                        ].map((service, idx) => (
                            <div key={idx} className="group space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <service.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                                        {service.title}
                                    </h4>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <ClassicDialog
                    title={classicDialog.title}
                    message={classicDialog.message}
                    open={classicDialog.isOpen}
                    positiveButtonText={classicDialog.positiveButtonText}
                    negativeButtonText={classicDialog.negativeButtonText}
                    hideNegativeButton={classicDialog.isNegativeButtonHidden}
                    onPositiveClick={() => {
                        setClassicDialog((prev) => ({
                            ...prev,
                            action: null,
                            isOpen: false,
                        }));
                    }}
                    onNegativeClick={() => {
                        setClassicDialog((prev) => ({
                            ...prev,
                            action: null,
                            isOpen: false,
                        }));
                    }}
                />
            </section>

            <Toaster />
        </PublicLayout>
    );
}