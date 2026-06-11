import { ActionCenterForm } from '@/components/ActionCenter/RequestAssistanceBeneficiaryForm';
import { LogInSignUpForm } from '@/components/LoginSignUpForm';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PublicLayout from '@/layouts/Public/PublicLayout';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Ambulance, Bus, Clock, FileText, HandHeart, Heart, ShieldCheck, Sparkles, Users, Wallet } from 'lucide-react';
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
        <PublicLayout title="Action Center ng MSWD" description="Mga Serbisyo at Tulong Panlipunan para sa Komunidad">
            {/* Hero Section with Warm Aesthetic & Blur Blobs */}
            <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-background to-background px-4 py-20 md:py-32 dark:from-orange-950/10">
                {/* Decorative Blur Blobs for Premium Aesthetic */}
                <div className="pointer-events-none absolute top-1/4 left-1/10 -z-10 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-900/10" />
                <div className="pointer-events-none absolute top-1/3 right-1/10 -z-10 h-80 w-80 rounded-full bg-rose-200/20 blur-3xl dark:bg-rose-950/10" />

                {/* Optional Subtle Grid Pattern */}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:24px_24px]" />

                <div className="relative z-10 mx-auto max-w-4xl space-y-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/60 bg-orange-100/60 px-4 py-2 text-xs font-bold tracking-wider text-orange-800 uppercase shadow-sm dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-300">
                        <Heart className="h-3.5 w-3.5 animate-pulse fill-orange-500 text-orange-500" />
                        Serbisyong may Malasakit at Kalinga
                    </div>

                    <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                        May Karamay Ka sa Panahon ng <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-rose-400">
                            Pangangailangan
                        </span>
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-muted-foreground md:text-xl">
                        Ang Municipal Action Center ng MSWD ay laging handang maghatid ng tulong para sa ating mga kababayan. Narito kami upang
                        gabayan kayo sa mga serbisyong medikal, pinansyal, at iba pang suporta.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                        {auth.user ? (
                            <>
                                <Button
                                    size="lg"
                                    className="h-14 bg-gradient-to-r from-orange-600 to-rose-600 px-8 text-base font-bold tracking-wider text-white uppercase shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-105 hover:from-orange-500 hover:to-rose-500 active:scale-95"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    <HandHeart className="mr-2 h-5 w-5" />
                                    Humingi ng Tulong (Apply Now)
                                </Button>

                                <ActionCenterForm
                                    onSubmitSuccess={(title, message) => {
                                        setClassicDialog((prev) => ({
                                            ...prev,
                                            isOpen: true,
                                            title: title,
                                            message: message,
                                            positiveButtonText: 'Isara',
                                            isNegativeButtonHidden: true,
                                        }));
                                    }}
                                    isOpen={isDialogOpen}
                                    onClose={() => setIsDialogOpen(false)}
                                    editData={null}
                                />
                            </>
                        ) : (
                            <div className="mx-auto w-full max-w-md space-y-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-md backdrop-blur-md">
                                                <LogInSignUpForm />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-foreground font-semibold text-background">
                                            <p>Mangyaring mag-log in o mag-register muna upang makagawa ng aplikasyon.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Step-by-Step Flow Section (Warm and structured addition) */}
            <section className="border-y border-border/40 bg-muted/20 py-16">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="mb-12 space-y-3 text-center">
                        <span className="text-xs font-bold tracking-widest text-primary/70 uppercase">Gabay sa Aplikasyon</span>
                        <h3 className="text-2xl font-extrabold text-foreground md:text-3xl">4 na Hakbang upang Makakuha ng Tulong</h3>
                        <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-orange-500 to-rose-500" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        {[
                            {
                                step: '01',
                                title: 'Mag-Login o Mag-Register',
                                description: 'Gumawa ng account sa ating portal at kumpletuhin ang inyong profile details.',
                                icon: Users,
                            },
                            {
                                step: '02',
                                title: 'Pumili ng Programa',
                                description: 'Pumili sa mga listahan ng tulong panlipunan na tugma sa inyong kasalukuyang pangangailangan.',
                                icon: Sparkles,
                            },
                            {
                                step: '03',
                                title: 'I-upload ang Dokumento',
                                description: 'Kunan ng malinaw na larawan at i-upload ang mga sumusuportang dokumento tulad ng Barangay Indigency.',
                                icon: FileText,
                            },
                            {
                                step: '04',
                                title: 'Pagproseso at Pagsusuri',
                                description: 'I-evaluate ng MSWD ang aplikasyon. Maghintay ng mensahe o tawag mula sa aming social worker.',
                                icon: Clock,
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="relative flex flex-col items-center rounded-xl border border-border/50 bg-card p-5 text-center shadow-sm"
                            >
                                <span className="absolute top-3 left-4 text-xs font-black tracking-wider text-primary/20">HAKBANG {item.step}</span>
                                <div className="mt-4 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h4 className="mb-2 text-base font-bold text-foreground">{item.title}</h4>
                                <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Assistance Programs Grid */}
            <section className="container mx-auto max-w-6xl px-4 py-20">
                <div className="mb-16 space-y-3 text-center">
                    <span className="text-xs font-bold tracking-widest text-primary/70 uppercase">Ating mga Programa</span>
                    <h3 className="text-2xl font-extrabold text-foreground md:text-3xl">Mga Serbisyo at Tulong na Maaaring Ma-avail</h3>
                    <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-orange-500 to-rose-500" />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            title: 'Tulong Medikal (Medical Assistance)',
                            icon: Ambulance,
                            description:
                                'Suporta sa gastusing medikal tulad ng pambili ng gamot, bayad sa hospital bill, at mga laboratory procedures.',
                            color: 'from-blue-500/10 to-cyan-500/5',
                        },
                        {
                            title: 'Tulong sa Libing (Burial Assistance)',
                            icon: HandHeart,
                            description:
                                'Pakikiramay at pag-alalay sa pamilya para sa mga gastusin sa serbisyong punerarya at pagpapalibing ng yumaong mahal sa buhay.',
                            color: 'from-orange-500/10 to-rose-500/5',
                        },
                        {
                            title: 'Tulong Pinansyal (Financial Assistance)',
                            icon: Wallet,
                            description: 'Pang-emerhensyang tulong-salapi para sa iba pang kagyat na pangangailangan ng inyong pamilya.',
                            color: 'from-emerald-500/10 to-teal-500/5',
                        },
                        {
                            title: 'Tulong sa Pagkain (Food Assistance)',
                            icon: ShieldCheck,
                            description: 'Pamamahagi ng mga relief goods o food packs para sa mga pamilyang labis na naapektuhan ng krisis o sakuna.',
                            color: 'from-red-500/10 to-orange-500/5',
                        },
                        {
                            title: 'Tulong sa Transportasyon (Transportation)',
                            icon: Bus,
                            description:
                                'Tulong-pamasahe para sa mga kababayang kailangang umuwi sa kanilang probinsya o kailangang bumiyahe para sa pagpapagamot.',
                            color: 'from-indigo-500/10 to-violet-500/5',
                        },
                        {
                            title: 'Suportang Pang-Komunidad (Community Resources)',
                            icon: Users,
                            description: 'Ugnayan sa iba pang ahensya ng gobyerno at mga lokal na serbisyo para sa inyong pangkalahatang kagalingan.',
                            color: 'from-pink-500/10 to-rose-500/5',
                        },
                    ].map((service, idx) => (
                        <div
                            key={idx}
                            className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md"
                        >
                            <div className="space-y-4">
                                <div
                                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${service.color} text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground`}
                                >
                                    <service.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
                                        {service.title}
                                    </h4>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Warm Community Note/Footer-Card */}
            <section className="container mx-auto max-w-4xl px-4 pb-20">
                <div className="space-y-6 rounded-3xl border border-orange-200/50 bg-gradient-to-br from-orange-500/10 to-rose-500/5 p-8 text-center md:p-12 dark:border-orange-900/30">
                    <Heart className="mx-auto h-10 w-10 fill-orange-500 text-orange-500" />
                    <h4 className="text-xl font-bold text-foreground md:text-2xl">Narito kami upang makinig at tumulong</h4>
                    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                        Kung mayroon kayong mga katanungan o nangangailangan ng personal na gabay sa walk-in application, huwag mag-atubiling bumisita
                        sa pinakamalapit na <strong>MSWD Office</strong> sa inyong munisipyo. Ang aming mga social worker ay laging handang maglingkod
                        nang may buong kalinga.
                    </p>
                </div>
            </section>

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

            <Toaster />
        </PublicLayout>
    );
}
