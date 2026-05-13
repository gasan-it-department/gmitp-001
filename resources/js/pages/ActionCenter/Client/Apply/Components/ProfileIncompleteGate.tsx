import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronRight, MapPin, UserCircle } from 'lucide-react';

interface Props {
    programName: string;
    setupUrl: string;
}

/**
 * Shown when the authenticated user has no ac_beneficiaries row yet.
 * Walks them through the two things they need before they can apply.
 */
export function ProfileIncompleteGate({ programName, setupUrl }: Props) {
    const steps = [
        {
            icon: UserCircle,
            title: 'Personal Information',
            detail: 'Full name, sex, date of birth, religion, educational attainment',
        },
        {
            icon: MapPin,
            title: 'Home Address',
            detail: 'Province → Municipality → Barangay → Street / Purok',
        },
    ];

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                        <UserCircle className="h-10 w-10 text-amber-600" />
                    </div>
                </div>

                {/* Heading */}
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Complete Your Profile First</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        To apply for <strong className="text-slate-700">{programName}</strong>, we need to record your
                        identity and address. This is a one-time setup — you won't need to do it again.
                    </p>
                </div>

                {/* Steps */}
                <div className="mb-8 space-y-3">
                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={i}
                                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#005088]/10">
                                    <Icon className="h-5 w-5 text-[#005088]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.detail}</p>
                                </div>
                                <span className="shrink-0 text-xs font-bold text-slate-300">0{i + 1}</span>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <Link href={setupUrl} className="block">
                    <Button className="h-14 w-full rounded-2xl bg-[#005088] text-sm font-black tracking-widest text-white uppercase shadow-lg shadow-blue-900/20 transition-all hover:bg-[#003d66] active:scale-[0.98]">
                        Set Up My Profile
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>

                <p className="mt-4 text-center text-xs text-slate-400">Takes about 2 minutes.</p>
            </div>
        </div>
    );
}
