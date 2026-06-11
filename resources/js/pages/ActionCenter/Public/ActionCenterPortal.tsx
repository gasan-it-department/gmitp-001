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
} from 'lucide-react';
import { useState } from 'react';

// 1. Define the Expected Interface from Laravel

// Mirrors EligibilityResult::toArray() on the backend. The map is empty for
// guests / profile-incomplete users — the page treats that as "no gating."
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

export default function ActionCenterPortal({ assistanceTypes, eligibilityByType, profileVerification }: Props) {
    const assistanceData = assistanceTypes.data;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
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
                </div>
            </section>

            {/* --- DYNAMIC SERVICES OVERVIEW --- */}
            <section className="container mx-auto px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    {profileVerification && !profileVerification.identity_verified && (
                        <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                            <div>
                                <p className="font-semibold">Your beneficiary profile is awaiting MSWD review.</p>
                                <p className="mt-0.5 text-sm text-amber-800">
                                    Assistance programs will become available after an administrator verifies your identity and household intake.
                                </p>
                            </div>
                        </div>
                    )}
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
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {activeAssistance.map((type) => {
                                const Icon = getAssistanceIcon(type.name);

                                // Eligibility is only set for signed-in citizens with a profile.
                                // Absent entry → assume eligible (guest / pre-profile flow).
                                const eligibility = eligibilityByType?.[type.id];
                                const isBlocked = eligibility ? !eligibility.eligible : false;

                                // Each card routes to /{municipality}/action-center/apply/{slug}.
                                // Wayfinder resolves both params — no Ziggy needed.
                                const applyHref = auth.user
                                    ? apply.assistance.url({ municipality: currentMunicipality.slug, assistanceType: type.slug })
                                    : '#';

                                // Shared card body so the disabled and enabled branches stay
                                // visually identical apart from the wrapper element.
                                const cardBody = (
                                    <>
                                        <div className="flex items-start justify-between">
                                            <div
                                                className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors ${
                                                    !isBlocked && 'group-hover:bg-primary group-hover:text-primary-foreground'
                                                }`}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>

                                            {isBlocked && (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold tracking-widest text-rose-700 uppercase">
                                                    {eligibility?.reason === 'in_flight_request' ? (
                                                        <>
                                                            <Clock className="h-3 w-3" /> pending
                                                        </>
                                                    ) : eligibility?.reason === 'on_cooldown' ? (
                                                        <>
                                                            <CalendarClock className="h-3 w-3" /> on cooldown
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="h-3 w-3" /> unavailable
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4
                                                className={`line-clamp-2 text-lg font-bold tracking-tight text-foreground uppercase transition-colors ${
                                                    !isBlocked && 'group-hover:text-primary'
                                                }`}
                                                title={type.name}
                                            >
                                                {type.name}
                                            </h4>

                                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground" title={type.description}>
                                                {type.description || 'No description available.'}
                                            </p>
                                        </div>

                                        {/* Business rules + per-citizen status footer */}
                                        <div className="mt-auto flex flex-wrap gap-2 border-t border-border/50 pt-4">
                                            {isBlocked ? (
                                                // When blocked we replace the generic chips with the
                                                // *specific* reason this citizen can't apply right now.
                                                <p className="text-xs font-medium text-rose-700" title={eligibility?.message}>
                                                    {eligibility?.message}
                                                </p>
                                            ) : (
                                                <>
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
                                                </>
                                            )}
                                        </div>
                                    </>
                                );

                                // Blocked → render as a non-interactive div so the user can still
                                // READ the card but can't navigate. We deliberately don't render a
                                // <Link> with a disabled prop because Inertia <Link> has no native
                                // disabled state and aria-disabled on an anchor still navigates.
                                if (isBlocked) {
                                    return (
                                        <div
                                            key={type.id}
                                            role="group"
                                            aria-disabled="true"
                                            title={eligibility?.message}
                                            className="flex cursor-not-allowed flex-col space-y-4 rounded-xl border border-border bg-muted/40 p-6 opacity-60 shadow-sm"
                                        >
                                            {cardBody}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={type.id}
                                        href={applyHref}
                                        className="group flex flex-col space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                                        onClick={(e) => {
                                            if (!auth.user) {
                                                e.preventDefault();
                                                setIsDialogOpen(true);
                                            }
                                        }}
                                    >
                                        {cardBody}
                                    </Link>
                                );
                            })}
                        </div>
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
