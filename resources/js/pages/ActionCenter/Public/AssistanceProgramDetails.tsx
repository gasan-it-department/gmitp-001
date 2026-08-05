import { AssistanceTypeDetails } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import actionCenter from '@/routes/actionCenter';
import apply from '@/routes/actionCenter/apply';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Banknote,
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileCheck2,
    LockKeyhole,
    ShieldAlert,
    UserRoundPlus,
} from 'lucide-react';
import { DocumentsToBringChecklist } from '../Client/Apply/Components/DocumentsToBringChecklist';

type ApplicationStatus = 'no_profile' | 'pending' | 'rejected' | 'eligible' | 'blocked';

interface ApplicationState {
    status: ApplicationStatus;
    reason: string | null;
    message: string;
    cooldown_ends_at: string | null;
}

interface Props {
    assistanceType: { data: AssistanceTypeDetails } | AssistanceTypeDetails;
    applicationState: ApplicationState;
}

const formatAmount = (amount: number): string =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(amount);

export default function AssistanceProgramDetails({ assistanceType, applicationState }: Props) {
    const program = 'data' in assistanceType ? assistanceType.data : assistanceType;
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;

    const minimumAmount = Number(program.min_amount ?? 0);
    const maximumAmount = program.max_amount === null ? null : Number(program.max_amount);
    const amountLabel =
        maximumAmount === null
            ? 'Depende sa assessment'
            : minimumAmount > 0
              ? `${formatAmount(minimumAmount)} - ${formatAmount(maximumAmount)}`
              : `Hanggang ${formatAmount(maximumAmount)}`;
    const availabilityLabel =
        program.cooldown_type === 'one_time'
            ? 'Isang beses na tulong'
            : program.cooldown_months > 0
              ? `Kada ${program.cooldown_months} buwan`
              : 'Depende sa pangangailangan';

    const statePresentation = getStatePresentation(applicationState);
    const StateIcon = statePresentation.icon;

    const renderPrimaryAction = () => {
        if (applicationState.status === 'eligible') {
            return (
                <Link
                    href={apply.assistance.url({ municipality: currentMunicipality.slug, assistanceType: program.slug })}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#005088] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#003d66] focus-visible:ring-2 focus-visible:ring-[#005088] focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    Apply para sa assistance na ito
                    <ArrowRight className="h-4 w-4" />
                </Link>
            );
        }

        if (applicationState.status === 'no_profile') {
            return (
                <Link
                    href={actionCenter.profile.setup.url({ municipality: currentMunicipality.slug })}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#005088] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#003d66] focus-visible:ring-2 focus-visible:ring-[#005088] focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    Gumawa ng beneficiary profile
                    <ArrowRight className="h-4 w-4" />
                </Link>
            );
        }

        if (applicationState.status === 'rejected') {
            return (
                <Link
                    href={actionCenter.profile.correction.url({ municipality: currentMunicipality.slug })}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#005088] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#003d66] focus-visible:ring-2 focus-visible:ring-[#005088] focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    I-update ang beneficiary profile
                    <ArrowRight className="h-4 w-4" />
                </Link>
            );
        }

        if (applicationState.reason === 'in_flight_request') {
            return (
                <Link
                    href={actionCenter.index.url({ municipality: currentMunicipality.slug })}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#005088] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#003d66] focus-visible:ring-2 focus-visible:ring-[#005088] focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    Tingnan ang aking mga request
                    <ArrowRight className="h-4 w-4" />
                </Link>
            );
        }

        return (
            <div
                aria-disabled="true"
                className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"
            >
                <LockKeyhole className="h-4 w-4" />
                Hindi available ang application
            </div>
        );
    };

    return (
        <PublicLayout title={program.name} description={program.description}>
            <Head title={program.name} />

            <div className="min-h-screen bg-slate-50 pb-16">
                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
                        <Link
                            href={actionCenter.portal.url({ municipality: currentMunicipality.slug })}
                            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#005088]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Bumalik sa mga assistance program
                        </Link>
                    </div>
                </div>

                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold tracking-wider text-[#005088] uppercase">MSWD Assistance Program</p>
                            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{program.name}</h1>
                            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{program.description}</p>
                        </div>

                        <dl className="mt-8 grid grid-cols-1 border-y border-slate-200 sm:grid-cols-2">
                            <div className="flex gap-3 py-4 sm:pr-5">
                                <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                <div>
                                    <dt className="text-xs font-bold text-slate-500 uppercase">Posibleng halaga</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900">{amountLabel}</dd>
                                </div>
                            </div>
                            <div className="flex gap-3 border-t border-slate-200 py-4 sm:border-t-0 sm:border-l sm:px-5">
                                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                <div>
                                    <dt className="text-xs font-bold text-slate-500 uppercase">Kailan Available</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900">{availabilityLabel}</dd>
                                </div>
                            </div>
                        </dl>

                        <p className="mt-4 text-xs leading-5 text-slate-500">
                            Ang halaga at pag-apruba ay dinedetermina ng MSWD pagkatapos ng interview, pagsusuri ng dokumento, at case assessment.
                        </p>
                    </div>
                </section>

                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <main className="space-y-8">
                        <DocumentsToBringChecklist documents={program.documents} />

                        <section className="border-t border-slate-200 pt-7">
                            <h2 className="text-lg font-bold text-slate-950">Paano ang proseso</h2>
                            <ol className="mt-5 space-y-5">
                                {[
                                    [
                                        '1',
                                        'Ihanda ang iyong impormasyon',
                                        'Basahin ang programa at siguraduhing tama ang impormasyon sa iyong beneficiary profile.',
                                    ],
                                    [
                                        '2',
                                        'I-submit ang iyong request online',
                                        'Matapos ma-verify ang iyong profile, ilagay ang dahilan kung bakit ka humihingi ng tulong.',
                                    ],
                                    [
                                        '3',
                                        'Pumunta sa MSWD dala ang mga dokumento',
                                        'Dalhin ang iyong transaction number at mga kinakailangang dokumento para sa interview at pagsusuri.',
                                    ],
                                ].map(([number, title, description]) => (
                                    <li key={number} className="flex gap-4">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#005088] text-xs font-bold text-white">
                                            {number}
                                        </span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{title}</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </main>

                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <section className={`rounded-lg border p-5 ${statePresentation.panelClass}`}>
                            <div className="flex items-start gap-3">
                                <StateIcon className={`mt-0.5 h-5 w-5 shrink-0 ${statePresentation.iconClass}`} />
                                <div>
                                    <h2 className="text-sm font-bold text-slate-950">{statePresentation.title}</h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-700">{applicationState.message}</p>
                                </div>
                            </div>

                            <div className="mt-5">{renderPrimaryAction()}</div>
                        </section>

                        <div className="mt-4 flex items-start gap-2 px-1 text-xs leading-5 text-slate-500">
                            <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0" />
                            Ang pagtingin sa programang ito ay hindi katumbas ng pag-apply o paggarantiya na maaaprubahan.
                        </div>
                    </aside>
                </div>
            </div>
        </PublicLayout>
    );
}

function getStatePresentation(state: ApplicationState) {
    if (state.status === 'eligible') {
        return {
            title: 'Handa nang magsimula',
            icon: CheckCircle2,
            panelClass: 'border-emerald-200 bg-emerald-50',
            iconClass: 'text-emerald-700',
        };
    }

    if (state.status === 'no_profile') {
        return {
            title: 'Kailangan ng beneficiary profile',
            icon: UserRoundPlus,
            panelClass: 'border-blue-200 bg-blue-50',
            iconClass: 'text-blue-700',
        };
    }

    if (state.status === 'pending') {
        return {
            title: 'Sinisiyasat pa ang profile',
            icon: Clock3,
            panelClass: 'border-amber-200 bg-amber-50',
            iconClass: 'text-amber-700',
        };
    }

    if (state.status === 'rejected') {
        return {
            title: 'Kailangang itama ang profile',
            icon: ShieldAlert,
            panelClass: 'border-red-200 bg-red-50',
            iconClass: 'text-red-700',
        };
    }

    return {
        title: state.reason === 'in_flight_request' ? 'May nakabinbin na request' : 'Hindi available ang application',
        icon: AlertCircle,
        panelClass: 'border-slate-300 bg-slate-100',
        iconClass: 'text-slate-700',
    };
}
