import Sites from '@/actions/App/External/Api/Controllers/Cemetery/Sites';
import { FormInput } from '@/components/FormInputField';
import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CreateCemeterySiteForm } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, MapPin, Save } from 'lucide-react';
import { FormEvent } from 'react';

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
            <div className="min-h-screen bg-slate-50/60 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Link
                        href={cemetery.admin.sites.list.page.url(municipality.slug)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back to cemetery dashboard
                    </Link>

                    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                <Building2 size={24} />
                            </span>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create Cemetery Site</h1>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Register a physical cemetery managed by {municipality.name}. Sections, blocks, and plots can be organized under
                                    this site afterward.
                                </p>
                            </div>
                        </div>
                    </header>

                    <form onSubmit={submit} className="space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                                <MapPin className="h-5 w-5 text-emerald-700" />
                                <div>
                                    <h2 className="font-semibold text-slate-900">Site Information</h2>
                                    <p className="text-sm text-slate-500">Use the official or commonly recognized cemetery name.</p>
                                </div>
                            </div>

                            <div className="grid gap-5 p-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <FormInput
                                        id="name"
                                        label="CEMETERY SITE NAME *"
                                        placeholder="e.g. GASAN CENTRAL CEMETERY"
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        isUppercase
                                        error={form.errors.name}
                                    />
                                </div>

                                <div>
                                    <BarangaySelect
                                        municipalityId={municipalityPsgcId}
                                        value={form.data.psgc_barangay_code}
                                        onChange={(selection) => form.setData('psgc_barangay_code', selection.psgc_code)}
                                        disabled={!municipalityPsgcId}
                                    />
                                    {form.errors.psgc_barangay_code && (
                                        <p className="mt-1 text-xs font-medium text-red-600">{form.errors.psgc_barangay_code}</p>
                                    )}
                                    {!municipalityPsgcId && (
                                        <p className="mt-1 text-xs text-amber-700">
                                            Configure the municipality PSGC reference before selecting a barangay.
                                        </p>
                                    )}
                                </div>

                                <FormInput
                                    id="street_name"
                                    label="STREET / PUROK"
                                    placeholder="e.g. PUROK 2, BONBON"
                                    value={form.data.street_name}
                                    onChange={(event) => form.setData('street_name', event.target.value)}
                                    isUppercase
                                    error={form.errors.street_name}
                                />

                                <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                                    Administrative Notes
                                    <Textarea
                                        value={form.data.notes}
                                        onChange={(event) => form.setData('notes', event.target.value)}
                                        placeholder="Optional operational notes about this cemetery site."
                                        className="mt-1.5 min-h-28"
                                    />
                                    {form.errors.notes && <span className="mt-1.5 block text-xs font-medium text-red-600">{form.errors.notes}</span>}
                                </label>
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline">
                                <Link href={cemetery.admin.sites.list.page.url(municipality.slug)}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.processing} className="bg-emerald-700 hover:bg-emerald-800">
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
