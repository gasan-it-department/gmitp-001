import { LogInSignUpForm } from '@/components/LoginSignUpForm';
import { Toaster } from '@/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import PublicLayout from '@/layouts/Public/PublicLayout';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ActionCenterForm } from './Components/ActionCenterForm';

export default function Home() {
    const { auth } = usePage<SharedData>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <PublicLayout title="Action Center" description="">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="mx-auto max-w-4xl space-y-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                        <Heart className="h-4 w-4" />
                        Community Support Services
                    </div>

                    <h2 className="text-4xl leading-tight font-bold text-balance text-foreground md:text-5xl lg:text-6xl">
                        We're Here to Help Our Community
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
                        The Municipal Action Center provides essential assistance to residents in need.
                        Whether you need food, medical, financial, or other support, we're here for you.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                        {auth.user ? (
                            <>
                                <Button
                                    size="lg"
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    Request Assistance
                                </Button>

                                {/* The Dialog */}
                                <ActionCenterForm
                                    isOpen={isDialogOpen}
                                    onClose={() => setIsDialogOpen(false)}
                                />
                            </>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-50">
                                            <LogInSignUpForm />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Please login before requesting for Assistance</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="container mx-auto border-t border-border px-4 py-16">
                <div className="mx-auto max-w-5xl">
                    <h3 className="mb-12 text-center text-2xl font-semibold text-foreground md:text-3xl">
                        Available Assistance Programs
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: 'Food Assistance', icon: '🍽️', description: 'Access to nutritious meals and food supplies for families in need.' },
                            { title: 'Medical Assistance', icon: '🏥', description: 'Support for medical expenses, prescriptions, and healthcare needs.' },
                            { title: 'Financial Assistance', icon: '💰', description: 'Emergency financial aid for utilities, rent, and essential expenses.' },
                            { title: 'Burial Assistance', icon: '🕊️', description: 'Compassionate support for funeral and burial expenses.' },
                            { title: 'Transportation Assistance', icon: '🚗', description: 'Help with transportation for medical appointments and essential travel.' },
                            { title: 'Community Resources', icon: '🤝', description: 'Connections to additional local services and support programs.' },
                        ].map((service, idx) => (
                            <div key={idx} className="space-y-3 rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md">
                                <div className="text-4xl">{service.icon}</div>
                                <h4 className="text-lg font-semibold text-foreground">{service.title}</h4>
                                <p className="leading-relaxed text-muted-foreground">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Toaster />
        </PublicLayout>
    );
}
