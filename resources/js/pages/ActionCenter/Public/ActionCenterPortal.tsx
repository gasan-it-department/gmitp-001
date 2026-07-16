import { Toaster } from '@/components/ui/sonner';
import { AssistanceTypeListItem } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import apply from '@/routes/actionCenter/apply';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Ambulance,
    Banknote,
    BookOpen,
    Bus,
    CalendarClock,
    Clock,
    FileText,
    HandHeart,
    Heart,
    Lock,
    ShieldCheck,
    Utensils,
    Wallet,
    Sparkles,
    Users,
} from 'lucide-react';
import { useState } from 'react';

// 1. Define the Expected Interface from Laravel
interface Eligibility {
    eligible: boolean;
    reason: 'on_cooldown' | 'permanent_block' | 'in_flight_request' | 'blacklisted' | 'identity_unverified' | 'dependent_unverified' | null;
    message: string;
    cooldown_ends_at: string | null;
}

interface Props {
    assistanceTypes: { data: AssistanceTypeListItem[] };
    eligibilityByType: Record<string, Eligibility>;
    profileVerification: { has_profile: boolean; identity_verified: boolean } | null;
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

// 3. Dynamic Color Mapper
const getAssistanceColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('medical')) return 'from-blue-500/10 to-cyan-500/5 hover:border-blue-450';
    if (lowerName.includes('burial')) return 'from-orange-500/10 to-rose-500/5 hover:border-orange-450';
    if (lowerName.includes('financial') || lowerName.includes('cash')) return 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-450';
    if (lowerName.includes('food')) return 'from-red-500/10 to-orange-500/5 hover:border-red-450';
    if (lowerName.includes('education') || lowerName.includes('school')) return 'from-purple-500/10 to-indigo-500/5 hover:border-purple-450';
    if (lowerName.includes('transport') || lowerName.includes('travel')) return 'from-indigo-500/10 to-violet-500/5 hover:border-indigo-450';
    return 'from-pink-500/10 to-rose-500/5 hover:border-pink-450';
};

export default function ActionCenterPortal({ assistanceTypes, eligibilityByType, profileVerification }: Props) {
    const assistanceData = assistanceTypes.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { auth } = usePage<SharedData>().props;
    const [classicDialog, setClassicDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        positiveButtonText: '',
        negativeButtonText: '',
        isNegativeButtonHidden: false,
        action: null as string | null,
    });

    // Filter out inactive ones so citizens only see what they can apply for
    const activeAssistance = assistanceData?.filter((type) => type.is_active) || [];

    return (
        <PublicLayout title="Action Center ng MSWD" description="Mga Serbisyo at Tulong Panlipunan para sa Komunidad">
            {/* Hero Section with Warm Aesthetic & Blur Blobs */}
            <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-background to-background dark:from-orange-950/10 px-4 py-20 md:py-32">
                {/* Decorative Blur Blobs */}
                <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none -z-10 dark:bg-orange-900/10" />
                <div className="absolute top-1/3 right-1/10 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none -z-10 dark:bg-rose-950/10" />
                
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

                <div className="relative z-10 mx-auto max-w-4xl space-y-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/60 bg-orange-100/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-800 shadow-sm dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-300">
                        <Heart className="h-3.5 w-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                        Portal ng Mamamayan (Citizen Portal)
                    </div>

                    <h2 className="text-4xl leading-tight font-extrabold text-foreground md:text-5xl lg:text-6xl tracking-tight">
                        May Karamay Ka sa Panahon ng <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-rose-400">Pangangailangan</span>
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-muted-foreground md:text-xl">
                        Ang Municipal Action Center ng MSWD ay laging handang maghatid ng tulong para sa ating mga kababayan. Pumili sa mga programa sa ibaba upang makapagsimula ng inyong aplikasyon.
                    </p>
                </div>
            </section>

            {/* Step-by-Step Flow Section (Warm and structured addition) */}
            <section className="border-y border-border/40 bg-muted/20 py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="mb-12 text-center space-y-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Gabay sa Aplikasyon</span>
                        <h3 className="text-2xl font-extrabold text-foreground md:text-3xl">
                            4 na Hakbang upang Makakuha ng Tulong
                        </h3>
                        <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-rose-500 mx-auto rounded-full" />
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
                            <div key={idx} className="relative flex flex-col items-center text-center p-5 bg-card rounded-xl border border-border/50 shadow-sm">
                                <span className="absolute top-3 left-4 text-xs font-black text-primary/20 tracking-wider">HAKBANG {item.step}</span>
                                <div className="mt-4 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h4 className="text-base font-bold text-foreground mb-2">{item.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DYNAMIC SERVICES OVERVIEW */}
            <section className="container mx-auto px-4 py-20 max-w-6xl">
                {profileVerification && !profileVerification.identity_verified && (
                    <div className="mb-10 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-amber-900 dark:border-amber-950/20 dark:bg-amber-950/10 dark:text-amber-300">
                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
                        <div>
                            <p className="font-bold">Ang iyong beneficiary profile ay kasalukuyang sinusuri ng MSWD.</p>
                            <p className="mt-1 text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
                                Ang mga programa ng tulong ay magiging bukas para sa inyo pagkatapos ma-verify ng administrator ang inyong pagkakakilanlan (identity) at household intake.
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="mb-16 space-y-3 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Ating mga Programa</span>
                    <h3 className="text-2xl font-extrabold text-foreground md:text-3xl">Pumili ng Tulong na Kailangan</h3>
                    <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-orange-500 to-rose-500" />
                </div>

                {activeAssistance.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted p-16 text-center bg-card/40">
                        <ShieldCheck className="mb-4 h-12 w-12 text-muted-foreground/40" />
                        <p className="text-lg font-medium text-muted-foreground">Kasalukuyang walang aktibong mga programa ng tulong sa inyong munisipyo.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeAssistance.map((type) => {
                            const Icon = getAssistanceIcon(type.name);
                            const cardColor = getAssistanceColor(type.name);

                            // Eligibility is only set for signed-in citizens with a profile.
                            // Absent entry → assume eligible (guest / pre-profile flow).
                            const eligibility = eligibilityByType?.[type.id];
                            const isBlocked = eligibility ? !eligibility.eligible : false;

                            // Each card routes to /{municipality}/action-center/apply/{slug}.
                            const applyHref = auth.user
                                ? apply.assistance.url({ municipality: currentMunicipality.slug, assistanceType: type.slug })
                                : '#';

                            // Shared card body so the disabled and enabled branches stay visually identical
                            const cardBody = (
                                <>
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${
                                                isBlocked ? 'from-gray-500/10 to-gray-600/5 text-gray-500' : `${cardColor} text-primary`
                                            } transition-colors duration-300 ${
                                                !isBlocked && 'group-hover:bg-primary group-hover:text-primary-foreground'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {isBlocked && (
                                            <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-rose-700 uppercase dark:bg-rose-950/20 dark:text-rose-400">
                                                {eligibility?.reason === 'in_flight_request' ? (
                                                    <>
                                                        <Clock className="h-3 w-3" /> nakabinbin
                                                    </>
                                                ) : eligibility?.reason === 'on_cooldown' ? (
                                                    <>
                                                        <CalendarClock className="h-3 w-3" /> sa cooldown
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="h-3 w-3" /> hindi maaari
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h4
                                            className={`line-clamp-2 text-base font-bold tracking-tight text-foreground transition-colors duration-200 ${
                                                !isBlocked && 'group-hover:text-primary'
                                            }`}
                                            title={type.name}
                                        >
                                            {type.name}
                                        </h4>

                                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground" title={type.description}>
                                            {type.description || 'Walang paglalarawan na ibinigay.'}
                                        </p>
                                    </div>

                                    {/* Business rules + per-citizen status footer */}
                                    <div className="mt-auto flex flex-wrap gap-2 border-t border-border/50 pt-4">
                                        {isBlocked ? (
                                            // Translate the block message if possible, or show backend message
                                            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400" title={eligibility?.message}>
                                                {eligibility?.message}
                                            </p>
                                        ) : (
                                            <>
                                                {type.max_amount && Number(type.max_amount) > 0 && (
                                                    <div className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                        <Banknote className="h-3.5 w-3.5" />
                                                        Abot sa ₱{Number(type.max_amount).toLocaleString()}
                                                    </div>
                                                )}

                                                {type.cooldown_months > 0 && (
                                                    <div className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                        <CalendarClock className="h-3.5 w-3.5" />
                                                        {type.cooldown_months} Buwang Cooldown
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            );

                            if (isBlocked) {
                                return (
                                    <div
                                        key={type.id}
                                        role="group"
                                        aria-disabled="true"
                                        title={eligibility?.message}
                                        className="flex cursor-not-allowed flex-col space-y-4 rounded-2xl border border-border/60 bg-muted/40 p-6 opacity-60 shadow-sm"
                                    >
                                        {cardBody}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={type.id}
                                    href={applyHref}
                                    className="group flex flex-col space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                                    onClick={(e) => {
                                        if (!auth.user) {
                                            e.preventDefault();
                                            setClassicDialog((prev) => ({
                                                ...prev,
                                                isOpen: true,
                                                title: 'Kailangan ng Account',
                                                message: 'Mangyaring mag-log in o mag-register muna upang makagawa ng aplikasyon para sa tulong.',
                                                positiveButtonText: 'Sige',
                                                isNegativeButtonHidden: true,
                                            }));
                                        }
                                    }}
                                >
                                    {cardBody}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Warm Community Note/Footer-Card */}
            <section className="container mx-auto px-4 pb-20 max-w-4xl">
                <div className="bg-gradient-to-br from-orange-500/10 to-rose-500/5 border border-orange-200/50 dark:border-orange-900/30 rounded-3xl p-8 md:p-12 text-center space-y-6">
                    <Heart className="h-10 w-10 text-orange-500 fill-orange-500 mx-auto" />
                    <h4 className="text-xl font-bold text-foreground md:text-2xl">Narito kami upang makinig at tumulong</h4>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Kung mayroon kayong mga katanungan o nangangailangan ng personal na gabay sa walk-in application, huwag mag-atubiling bumisita sa pinakamalapit na <strong>MSWD Office</strong> sa inyong munisipyo. Ang aming mga social worker ay laging handang maglingkod nang may buong kalinga.
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
                    setClassicDialog((prev) => ({ ...prev, action: null, isOpen: false }));
                }}
                onNegativeClick={() => {
                    setClassicDialog((prev) => ({ ...prev, action: null, isOpen: false }));
                }}
            />

            <Toaster />
        </PublicLayout>
    );
}
