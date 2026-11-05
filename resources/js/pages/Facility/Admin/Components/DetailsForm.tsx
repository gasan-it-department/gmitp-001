import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    AdminFacility,
    emptyAddressParts,
    FacilityAddressOption,
    FacilityAddressParts,
    formatAddressParts,
    Option,
} from '@/Core/Types/Facility/FacilityTypes';
import { useForm } from '@inertiajs/react';
import FormErrors from '../../Components/FormErrors';
import FacilityAddressFields from './FacilityAddressFields';

export default function DetailsForm({
    facility,
    types,
    barangays,
    slug,
    editable,
}: {
    facility: AdminFacility | null;
    types: Option[];
    barangays: FacilityAddressOption[];
    slug: string;
    editable: boolean;
}) {
    const form = useForm({
        name: facility?.name ?? '',
        type: facility?.type.value ?? 'park',
        description: facility?.description ?? '',
        location_name: facility?.location_name ?? '',
        address: facility?.address ?? '',
        address_parts: (facility?.address ? null : emptyAddressParts()) as FacilityAddressParts | null,
        contact_name: facility?.contact_name ?? '',
        contact_phone: facility?.contact_phone ?? '',
        contact_email: facility?.contact_email ?? '',
        image: null as File | null,
        remove_image: false as boolean,
    });
    const fields = [
        ['name', 'Facility name'],
        ['location_name', 'Place or landmark name'],
        ['contact_name', 'Public contact'],
        ['contact_phone', 'Public phone'],
        ['contact_email', 'Public email'],
    ] as const;
    return (
        <section className="rounded-xl border bg-white p-5 sm:p-6">
            <h2 className="mb-5 text-lg font-semibold">Facility details</h2>
            <form
                className="space-y-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    const savedAddress = form.data.address_parts ? formatAddressParts(form.data.address_parts) : form.data.address;
                    form.transform((data) => (facility ? { ...data, revision: facility.revision, _method: 'put' } : data));
                    form.post(facility ? `/api/facility/${facility.id}` : '/api/facility', {
                        headers: { 'X-Municipality-Slug': slug },
                        forceFormData: true,
                        preserveScroll: true,
                        onSuccess: () => {
                            form.setData((data) => ({ ...data, address: savedAddress, address_parts: null, image: null, remove_image: false }));
                        },
                    });
                }}
            >
                <fieldset disabled={!editable || form.processing} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {fields.map(([key, label]) => (
                            <label key={key} className="space-y-1 text-sm font-medium">
                                <span>
                                    {label}
                                    {key === 'name' ? ' *' : ''}
                                </span>
                                <Input
                                    name={key}
                                    required={key === 'name'}
                                    type={key === 'contact_email' ? 'email' : 'text'}
                                    value={form.data[key]}
                                    onChange={(e) => form.setData(key, e.target.value)}
                                    aria-invalid={Boolean(form.errors[key])}
                                />
                                {key === 'location_name' && (
                                    <span className="block text-xs font-normal text-slate-500">For example, Municipal Plaza.</span>
                                )}
                                {form.errors[key] && <span className="text-red-700">{form.errors[key]}</span>}
                            </label>
                        ))}
                    </div>
                    <label className="block space-y-1 text-sm font-medium">
                        <span>Facility type *</span>
                        <select
                            className="h-10 w-full rounded-md border bg-white px-3"
                            value={form.data.type}
                            onChange={(e) => form.setData('type', e.target.value)}
                        >
                            {types.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block space-y-1 text-sm font-medium">
                        <span>Description</span>
                        <Textarea rows={4} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                    </label>
                    <FacilityAddressFields
                        savedAddress={form.data.address}
                        parts={form.data.address_parts}
                        barangays={barangays}
                        disabled={!editable || form.processing}
                        errors={form.errors}
                        onChange={(parts) => form.setData('address_parts', parts)}
                        onClear={() => form.setData((data) => ({ ...data, address: '', address_parts: null }))}
                    />
                    {facility?.image_url && <img src={facility.image_url} alt={facility.name} className="h-40 rounded-lg object-cover" />}
                    <label className="block space-y-1 text-sm">
                        <span className="block font-medium">Facility image</span>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                                form.setData('image', e.target.files?.[0] ?? null);
                                form.setData('remove_image', false);
                            }}
                        />
                        <span className="text-slate-500">JPEG, PNG or WebP. Maximum 10 MB.</span>
                    </label>
                    {facility?.image_url && !form.data.image && (
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.remove_image}
                                onChange={(e) => form.setData('remove_image', e.target.checked)}
                            />
                            Remove existing image
                        </label>
                    )}
                </fieldset>
                <FormErrors errors={form.errors} />
                {editable && (
                    <Button disabled={form.processing}>{form.processing ? 'Saving…' : facility ? 'Save details' : 'Create draft facility'}</Button>
                )}
                {form.progress && <p className="text-sm">Uploading: {form.progress.percentage}%</p>}
            </form>
        </section>
    );
}
