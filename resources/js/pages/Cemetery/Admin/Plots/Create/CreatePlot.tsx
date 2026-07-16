import Plots from '@/actions/App/External/Api/Controllers/Cemetery/Plots';
import { FormInput } from '@/components/FormInputField';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlockLookup, CemeterySiteListItem, CreatePlotForm, PlotTypeValue, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, LandPlot } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    blocks: BlockLookup[];
    type_options: SelectOption<PlotTypeValue>[];
}

export default function CreatePlot({ municipality, site, blocks, type_options }: Props) {
    const standardPlotTypeOptions = type_options.filter((option) => option.value !== 'apartment_niche');
    const { data, setData, post, processing, errors } = useForm<CreatePlotForm>({
        block_id: '',
        name: '',
        type: '',
        capacity: 1,
        area_sqm: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(Plots.StorePlotController.url({ cemetery_site_id: site.id }), {
            headers: {
                'X-Municipality-Slug': municipality.slug,
            },
        });
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <Link
                    href={cemetery.admin.sites.workspace.page.url({
                        municipality: municipality.slug,
                        cemetery_site_id: site.id,
                    })}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Back to plots
                </Link>

                <header className="flex items-start gap-3 border-b border-slate-200 pb-5">
                    <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                        <LandPlot size={20} />
                    </span>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Register New Plot</h1>
                        <p className="text-sm text-slate-500">
                            Add a standard burial location to {site.name}. Use the apartment niche generator for apartment-style slots.
                        </p>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 border-b border-slate-100 pb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase">Location</h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-slate-700">BLOCK *</label>
                                <Select value={data.block_id} onValueChange={(v) => setData('block_id', v)}>
                                    <SelectTrigger className={errors.block_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select a block" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {blocks.length === 0 && (
                                                <SelectItem value="__none" disabled>
                                                    No active blocks configured yet
                                                </SelectItem>
                                            )}
                                            {blocks.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.section ? `${b.section.name} / ${b.name}` : b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.block_id && <p className="mt-1 text-xs text-red-600">{errors.block_id}</p>}
                            </div>

                            <FormInput
                                id="name"
                                label="PLOT NAME *"
                                placeholder="e.g. LOT 737"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                isUppercase
                                error={errors.name}
                            />

                            <FormInput
                                id="row"
                                label="ROW"
                                placeholder="e.g. R-7"
                                value={data.row}
                                onChange={(e) => setData('row', e.target.value)}
                                isUppercase
                                error={errors.row}
                            />

                            <FormInput
                                id="position"
                                label="POSITION (optional)"
                                placeholder="e.g. LEFT / RIGHT"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                isUppercase
                                error={errors.position}
                            />
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 border-b border-slate-100 pb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                            Classification
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">PLOT TYPE *</label>
                                <Select value={data.type} onValueChange={(v) => setData('type', v as CreatePlotForm['type'])}>
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select plot type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {standardPlotTypeOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p className="mt-1 text-xs text-slate-500">Apartment niches are created through the dedicated generator.</p>
                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>

                            <div>
                                <FormInput
                                    id="capacity"
                                    label="CAPACITY *"
                                    type="number"
                                    value={String(data.capacity)}
                                    onChange={(e) => setData('capacity', e.target.value === '' ? '' : Number(e.target.value))}
                                    error={errors.capacity}
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Capacity means the maximum decedents/remains this physical plot can hold. It will not create child slots.
                                </p>
                            </div>
                            <div>
                                <FormInput
                                    id="area_sqm"
                                    label="AREA (SQM)"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 6.00"
                                    value={String(data.area_sqm)}
                                    onChange={(e) => setData('area_sqm', e.target.value === '' ? '' : Number(e.target.value))}
                                    error={errors.area_sqm}
                                />
                                <p className="mt-1 text-xs text-slate-500">Optional lot size. Apartment niches do not use area.</p>
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.visit(
                                    cemetery.admin.sites.workspace.page.url({
                                        municipality: municipality.slug,
                                        cemetery_site_id: site.id,
                                    }),
                                )
                            }
                            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Register Plot'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
