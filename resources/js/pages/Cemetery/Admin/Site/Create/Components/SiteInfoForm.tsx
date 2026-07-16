import { FormInput } from '@/components/FormInputField';
import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { Textarea } from '@/components/ui/textarea';
import { CreateCemeterySiteForm } from '@/Core/Types/Cemetery/cemetery';
import { MapPin } from 'lucide-react';

interface FormState {
    data: CreateCemeterySiteForm;
    errors: Partial<Record<keyof CreateCemeterySiteForm, string>>;
    setData: <K extends keyof CreateCemeterySiteForm>(key: K, value: CreateCemeterySiteForm[K]) => void;
}

interface Props {
    form: FormState;
    municipalityPsgcId: string;
}

export function SiteInfoForm({ form, municipalityPsgcId }: Props) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                    <MapPin className="h-5 w-5" />
                </div>
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
                    {form.errors.notes && (
                        <span className="mt-1.5 block text-xs font-medium text-red-600">{form.errors.notes}</span>
                    )}
                </label>
            </div>
        </section>
    );
}
