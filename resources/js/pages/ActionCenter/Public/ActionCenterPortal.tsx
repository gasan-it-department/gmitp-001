import { ActionCenterForm } from '@/components/ActionCenter/RequestAssistanceBeneficiaryForm';
import { LogInSignUpForm } from '@/components/LoginSignUpForm';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AssistanceTypeListItem } from '@/Core/Types/ActionCenter/assistance';
import PublicLayout from '@/layouts/Public/PublicLayout';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Ambulance, Banknote, BookOpen, Bus, CalendarClock, FileText, HandHeart, Heart, ShieldCheck, Utensils, Wallet } from 'lucide-react';
import { useState } from 'react';

// 1. Define the Expected Interface from Laravel

interface Props {
    assistanceTypes: { data: AssistanceTypeListItem[] };
}
// 2. Dynamic Icon Mapper
const getAssistanceIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('medical')) return Ambulance;
    if (lowerName.includes('burial')) return HandHeart;
    if (lowerName.includes('financial') || lowerName.includes('cash')) return Wallet;
    if (lowerName.includes('food')) return Utensils;
    if (lowerName.includes('education') || lowerName.includes('school')) return BookOpen;
    if (lowerName.includes('transport') || lowerName.includes('travel')) return Bus;
    return FileText; // Default fallback icon
};

export default function ActionCenterPortal({ assistanceTypes }: Props) {
    const assistanceData = assistanceTypes.data;

    const { auth } = usePage<SharedData>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
        action: null as string | null,
    });

    // Optional: Filter out inactive ones so citizens only see what they can apply for
    const activeAssistance = assistanceData?.filter((type) => type.is_active) || [];

    return (
        <PublicLayout title="Action Center" description="Social Welfare Services">
            {/* --- HERO SECTION (Remains Unchanged) --- */}
            <section className="relative overflow-hidden bg-muted/30 px-4 py-16 md:py-24">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:24px_24px]" />

                <div className="relative z-10 mx-auto max-w-4xl space-y-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black tracking-widest text-primary uppercase shadow-sm">
                        <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
                        Community Support Services
                    </div>

                    <h2 className="text-4xl leading-tight font-black tracking-tight text-foreground uppercase md:text-5xl lg:text-6xl">
                        We're Here to Help <br className="hidden sm:block" />
                        <span className="text-primary">Our Community</span>
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-muted-foreground md:text-xl">
                        The Municipal Action Center provides essential assistance to residents in need. Whether you need food, medical, financial, or
                        other support, we're here for you.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                        {auth.user ? (
                            <>
                                <Button
                                    size="lg"
                                    className="h-14 bg-primary px-8 text-base font-black tracking-widest text-primary-foreground uppercase shadow-xl transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    <HandHeart className="mr-2 h-5 w-5" />
                                    Request Assistance
                                </Button>

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
                                            <div className="rounded-xl border border-border bg-background p-1 shadow-sm">
                                                <LogInSignUpForm />
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-foreground font-bold text-background">
                                        <p>Please login before requesting for Assistance</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </section>

            {/* --- DYNAMIC SERVICES OVERVIEW --- */}
            <section className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 space-y-2 text-center">
                        <h3 className="text-2xl font-black tracking-widest text-foreground uppercase md:text-3xl">Assistance Programs</h3>
                        <div className="mx-auto h-1 w-20 rounded-full bg-primary" />
                    </div>

                    {activeAssistance.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted p-12 text-center">
                            <ShieldCheck className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium text-muted-foreground">No assistance programs are currently active.</p>
                        </div>
                    ) : (
                        <Link href="#">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {activeAssistance.map((type) => {
                                    const Icon = getAssistanceIcon(type.name);

                                    return (
                                        <div
                                            key={type.id}
                                            className="group flex flex-col space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h4
                                                    className="line-clamp-2 text-lg font-bold tracking-tight text-foreground uppercase transition-colors group-hover:text-primary"
                                                    title={type.name}
                                                >
                                                    {type.name}
                                                </h4>

                                                {/* 🎯 SENIOR TOUCH: Line-clamp keeps long Tagalog descriptions neat! */}
                                                <p
                                                    className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground"
                                                    title={type.description}
                                                >
                                                    {type.description || 'No description available.'}
                                                </p>
                                            </div>

                                            {/* 🎯 NEW: Business Rules displayed to the citizen */}
                                            <div className="mt-auto flex flex-wrap gap-2 border-t border-border/50 pt-4">
                                                {type.max_amount && Number(type.max_amount) > 0 && (
                                                    <div className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                        <Banknote className="h-3.5 w-3.5" />
                                                        Up to ₱{Number(type.max_amount).toLocaleString()}
                                                    </div>
                                                )}

                                                {type.cooldown_months > 0 && (
                                                    <div className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                        <CalendarClock className="h-3.5 w-3.5" />
                                                        {type.cooldown_months} Month Cooldown
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Link>
                    )}
                </div>

                {/* --- DIALOGS (Remains Unchanged) --- */}
                <ClassicDialog
                    title={classicDialog.title}
                    message={classicDialog.message}
                    open={classicDialog.isOpen}
                    positiveButtonText={classicDialog.positiveButtonText}
                    negativeButtonText={classicDialog.negativeButtonText}
                    hideNegativeButton={classicDialog.isNegativeButtonHidden}
                    onPositiveClick={() => {
                        setClassicDialog((prev) => ({ ...prev, action: null, isOpen: false }));
                    }}
                    onNegativeClick={() => {
                        setClassicDialog((prev) => ({ ...prev, action: null, isOpen: false }));
                    }}
                />
            </section>

            <Toaster />
        </PublicLayout>
    );
}
