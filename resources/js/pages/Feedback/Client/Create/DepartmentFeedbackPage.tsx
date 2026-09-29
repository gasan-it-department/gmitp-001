import { absoluteUrl, type SeoSharedData } from '@/components/Seo/PublicSeo';
import { type Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import PublicLayout from '@/layouts/Public/PublicLayout';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import { usePage } from '@inertiajs/react';
import { AlertCircle, Building2, MessageSquareText } from 'lucide-react';
import { useState } from 'react';
import { FeedbackFormContent, type DepartmentOption } from './Components/FeedbackFormContent';

interface DepartmentFeedbackPageProps {
    department: DepartmentOption & { logo_url: string | null };
    municipality_logo_url: string | null;
    submit_url: string;
    feedbackTypes: { value: string; label: string }[];
    is_eligible: boolean;
}

export default function DepartmentFeedbackPage({
    department,
    municipality_logo_url,
    submit_url,
    feedbackTypes,
    is_eligible,
}: DepartmentFeedbackPageProps) {
    const { currentMunicipality, seo } = usePage<{ currentMunicipality: Municipality; seo: SeoSharedData }>().props;
    const [logoUrl, setLogoUrl] = useState<string | null>(department.logo_url ?? municipality_logo_url);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '' });

    const handleLogoError = () => {
        setLogoUrl((current) => (current === department.logo_url && municipality_logo_url !== department.logo_url ? municipality_logo_url : null));
    };

    return (
        <PublicLayout
            title={`${department.name} Feedback | ${currentMunicipality.name}`}
            description={`Magbigay ng feedback para sa ${department.name} ng ${currentMunicipality.name}.`}
            canonicalUrl={absoluteUrl(`/${currentMunicipality.slug}/feedback/client/departments/${department.id}/create`, seo.site_url)}
        >
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50/70">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-6 sm:gap-5 sm:px-6 sm:py-8">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-20 sm:w-20">
                            {logoUrl ? (
                                <img src={logoUrl} alt="" onError={handleLogoError} className="h-full w-full object-contain p-2" />
                            ) : (
                                <Building2 className="h-8 w-8 text-slate-500" aria-hidden="true" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-500">{currentMunicipality.name}</p>
                            <h1 className="mt-1 text-xl leading-tight font-bold text-slate-950 sm:text-2xl">{department.name}</h1>
                            <p className="mt-1 text-sm text-slate-600">Feedback sa departamento</p>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
                    <div className="mb-7 flex items-start gap-3 border-b border-slate-200 pb-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                            <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">Ibahagi ang iyong karanasan</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                Ang may asterisk (*) lamang ang kinakailangan. Hindi kailangan ng personal na contact details.
                            </p>
                        </div>
                    </div>

                    {!is_eligible ? (
                        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                            <div>
                                <h3 className="font-bold">Naabot mo na ang limitasyon</h3>
                                <p className="mt-1 text-sm leading-6">Maaari kang magpadala ng hanggang 3 feedback kada araw. Subukan muli bukas.</p>
                            </div>
                        </div>
                    ) : (
                        <FeedbackFormContent
                            fixedDepartment={department}
                            submitUrl={submit_url}
                            feedbackTypes={feedbackTypes}
                            onSuccess={(message) => setDialog({ open: true, title: 'Salamat sa iyong Feedback!', message })}
                            onError={(message) => setDialog({ open: true, title: 'May mali sa pagpapadala!', message })}
                        />
                    )}
                </main>
            </div>

            <ClassicDialog
                title={dialog.title}
                message={dialog.message}
                open={dialog.open}
                positiveButtonText="Isara"
                hideNegativeButton
                onPositiveClick={() => setDialog((current) => ({ ...current, open: false }))}
            />
        </PublicLayout>
    );
}
