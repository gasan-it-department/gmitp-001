import Plots from '@/actions/App/External/Api/Controllers/Cemetery/Plots';
import { FormInput } from '@/components/FormInputField';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreatePlotForm, PlotStatusOption, PlotTypeValue, SelectOption } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LandPlot } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    municipality: MunicipalityType;
    sections: { id: string; name: string }[];
    type_options: SelectOption<PlotTypeValue>[];
    status_options: PlotStatusOption[];
}

export default function CreatePlot({ municipality, sections, type_options, status_options }: Props) {
    const { data, setData, post, processing, errors } = useForm<CreatePlotForm>({
        section_id: '',
        plot_number: '',
        name: '',
        type: '',
        status: 'available',
        total_capacity: 1,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(Plots.StorePlotController.url(), {
            headers: {
                'X-Municipality-Slug': municipality.slug,
            },
        });
    };

    const showCapacity = data.type === 'apartment_niche' || data.type === 'bone_ossuary' || data.type === 'mausoleum';

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <Link
                    href={cemetery.admin.plots.list.page.url(municipality.slug)}
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
                        <p className="text-sm text-slate-500">Add a physical burial location to the municipal cemetery inventory.</p>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 border-b border-slate-100 pb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                            Location
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">SECTION *</label>
                                <Select value={data.section_id} onValueChange={(v) => setData('section_id', v)}>
                                    <SelectTrigger className={errors.section_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select a section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {sections.length === 0 && (
                                                <SelectItem value="__none" disabled>
                                                    No sections configured yet
                                                </SelectItem>
                                            )}
                                            {sections.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.section_id && <p className="mt-1 text-xs text-red-600">{errors.section_id}</p>}
                            </div>

                            <FormInput
                                id="plot_number"
                                label="PLOT NUMBER *"
                                placeholder="e.g. A-12 / N-04-L2"
                                value={data.plot_number}
                                onChange={(e) => setData('plot_number', e.target.value)}
                                isUppercase
                                error={errors.plot_number}
                            />

                            <FormInput
                                id="name"
                                label="DISPLAY NAME"
                                placeholder="e.g. St. Peter Lawn"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                isUppercase
                                error={errors.name}
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
                                <Select
                                    value={data.type}
                                    onValueChange={(v) => setData('type', v as CreatePlotForm['type'])}
                                >
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select plot type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {type_options.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">INITIAL STATUS</label>
                                <Select
                                    value={data.status}
                                    onValueChange={(v) => setData('status', v as CreatePlotForm['status'])}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Available" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {status_options.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                            </div>

                            {showCapacity && (
                                <div className="md:col-span-2">
                                    <FormInput
                                        id="total_capacity"
                                        label="TOTAL CAPACITY (levels / slots)"
                                        type="number"
                                        value={String(data.total_capacity)}
                                        onChange={(e) => setData('total_capacity', e.target.value === '' ? '' : Number(e.target.value))}
                                        error={errors.total_capacity}
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        Multi-level structures (apartments, ossuaries, mausoleums) can list more than one slot.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Register Plot'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
