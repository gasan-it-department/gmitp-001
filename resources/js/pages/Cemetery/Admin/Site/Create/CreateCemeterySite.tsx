import Sites from '@/actions/App/External/Api/Controllers/Cemetery/Sites';
import { Button } from '@/components/ui/button';
import { CreateCemeterySiteForm } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { FormEvent } from 'react';
import { SiteInfoForm } from './Components/SiteInfoForm';

interface Props {
    municipality: MunicipalityType;
}

export default function CreateCemeterySite({ municipality }: Props) {
    const form = useForm<CreateCemeterySiteForm>({
        name: '',
        psgc_barangay_code: '',
        street_name: '',
        notes: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(Sites.StoreCemeterySiteController.url(), {
            headers: {
                'X-Municipality-Slug': municipality.slug,
            },
        });
    };

    const municipalityPsgcId = municipality.psgc_municipal_id ?? '';

    return (
        <AppLayout>
            <Head title="Create Cemetery Site" />

            <div className="min-h-screen bg-slate-50/60 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Link
                        href={cemetery.admin.sites.list.page.url(municipality.slug)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back to cemetery sites
                    </Link>

                    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600" />
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                    <Building2 size={24} />
                                </span>
                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                        Create Cemetery Site
                                    </h1>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Register a physical cemetery managed by {municipality.name}. Sections, blocks, and plots
                                        can be organized under this site afterward.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <form onSubmit={submit} className="space-y-6">
                        <SiteInfoForm form={form} municipalityPsgcId={municipalityPsgcId} />

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline">
                                <Link href={cemetery.admin.sites.list.page.url(municipality.slug)}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-emerald-700 hover:bg-emerald-800"
                            >
                                <Save size={16} className="mr-2" />
                                {form.processing ? 'Creating site...' : 'Create Site'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
