import { DatePicker } from '@/components/Shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CemeterySiteListItem, IntermentMoveContext, MoveIntermentForm, PlotListItem } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import cemetery from '@/routes/cemetery';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRightLeft, MapPin, Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface Props {
    municipality: MunicipalityType;
    interment: IntermentMoveContext;
    sites: CemeterySiteListItem[];
    available_plots: PlotListItem[];
}

export default function MoveInterment({ municipality, interment, sites, available_plots }: Props) {
    const [plotSearch, setPlotSearch] = useState('');
    const currentSiteId = interment.plot?.cemetery_site_id ?? sites[0]?.id ?? '';
    const { data, setData, post, processing, errors } = useForm<MoveIntermentForm>({
        destination_cemetery_site_id: currentSiteId,
        destination_plot_id: '',
        movement_date: '',
        reason: '',
        notes: '',
        requesting_party_name: '',
        requesting_party_contact: '',
        requesting_party_address: '',
        requesting_party_relationship: '',
        requester_is_leaseholder: false,
        leaseholder_consent_confirmed: false,
        leaseholder_consent_method: 'not_applicable',
        leaseholder_consent_reference: '',
        service_request_notes: '',
        authorization_evidence: null,
    });

    const destinationPlots = useMemo(() => {
        const search = plotSearch.trim().toLowerCase();

        return available_plots.filter((plot) => {
            if (plot.id === interment.plot?.id) return false;
            if (plot.cemetery_site_id !== data.destination_cemetery_site_id) return false;
            if (!search) return true;

            return [plot.slot_label, plot.type_label, plot.block?.section?.name, plot.block?.name]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(search);
        });
    }, [available_plots, data.destination_cemetery_site_id, interment.plot?.id, plotSearch]);

    const selectedPlot = destinationPlots.find((plot) => plot.id === data.destination_plot_id) ?? null;
    const sourceLease = interment.plot?.active_lease ?? null;
    const consentTargetLease = selectedPlot?.active_lease ?? sourceLease;
    const consentTargetSource = selectedPlot?.active_lease ? 'destination plot' : sourceLease ? 'current plot' : null;
    const needsLeaseholderConsent = Boolean(consentTargetLease && !data.requester_is_leaseholder);
    const requesterComplete = data.requesting_party_name.trim() !== '' && data.requesting_party_relationship.trim() !== '';
    const leaseholderConsentComplete =
        !needsLeaseholderConsent ||
        (data.leaseholder_consent_confirmed &&
            data.leaseholder_consent_method !== '' &&
            data.leaseholder_consent_method !== 'not_applicable' &&
            data.leaseholder_consent_reference.trim() !== '');

    const selectDestinationPlot = (plot: PlotListItem) => {
        setData({
            ...data,
            destination_plot_id: plot.id,
            requester_is_leaseholder: false,
            leaseholder_consent_confirmed: false,
            leaseholder_consent_method: plot.active_lease || sourceLease ? '' : 'not_applicable',
            leaseholder_consent_reference: '',
            authorization_evidence: null,
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(`/api/interments/${interment.id}/move`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
        });
    };

    const backUrl = interment.plot
        ? cemetery.admin.sites.plots.profile.page.url({
              municipality: municipality.slug,
              cemetery_site_id: interment.plot.cemetery_site_id,
              plot_id: interment.plot.id,
          })
        : cemetery.admin.sites.list.page.url({ municipality: municipality.slug });

    return (
        <AppLayout>
            <Head title={`Move Interment - ${interment.decedent_name}`} />

            <div className="m-6 space-y-6">
                <Link href={backUrl} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <ArrowLeft size={16} />
                    Back to current plot
                </Link>

                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <span className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
                            <ArrowRightLeft className="h-5 w-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Move Interment</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Move this active interment to another plot under the same municipality. The original interment will remain in the
                                timeline as ended history.
                            </p>
                        </div>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 font-semibold text-slate-900">Current Interment</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Detail label="Decedent" value={interment.decedent_name} />
                            <Detail label="Current Plot" value={interment.plot?.slot_label} />
                            <Detail label="Current Site" value={interment.plot?.cemetery_site?.name} />
                            <Detail
                                label="Section / Block"
                                value={[interment.plot?.section?.name, interment.plot?.block?.name].filter(Boolean).join(' / ')}
                            />
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <MapPin className="h-4 w-4 text-indigo-600" />
                            <h2 className="font-semibold text-slate-900">Destination Plot</h2>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Destination Cemetery Site</label>
                                <Select
                                    value={data.destination_cemetery_site_id}
                                    onValueChange={(value) => {
                                        setData({
                                            ...data,
                                            destination_cemetery_site_id: value,
                                            destination_plot_id: '',
                                            requester_is_leaseholder: false,
                                            leaseholder_consent_confirmed: false,
                                            leaseholder_consent_method: sourceLease ? '' : 'not_applicable',
                                            leaseholder_consent_reference: '',
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {sites.map((site) => (
                                                <SelectItem key={site.id} value={site.id}>
                                                    {site.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.destination_cemetery_site_id && <p className="text-xs text-red-600">{errors.destination_cemetery_site_id}</p>}
                            </div>

                            <div className="relative space-y-2 lg:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Search Destination Plots</label>
                                <Search className="absolute top-9 left-3 h-4 w-4 text-slate-400" />
                                <Input
                                    value={plotSearch}
                                    onChange={(event) => setPlotSearch(event.target.value)}
                                    placeholder="Search by plot, section, block, or type"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="mt-5 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                            {destinationPlots.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                    No available destination plots match this site/search.
                                </div>
                            ) : (
                                destinationPlots.map((plot) => {
                                    const selected = data.destination_plot_id === plot.id;

                                    return (
                                        <button
                                            key={plot.id}
                                            type="button"
                                            onClick={() => selectDestinationPlot(plot)}
                                            className={`w-full rounded-lg border p-4 text-left transition ${
                                                selected
                                                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-mono font-semibold text-slate-900">{plot.slot_label}</p>
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    {plot.occupancy_label}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {plot.block?.section?.name ?? '-'} / {plot.block?.name ?? '-'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">{plot.type_label}</p>
                                            {plot.active_lease && (
                                                <p className="mt-1 text-xs text-indigo-600">
                                                    Destination leaseholder: {plot.active_lease.leaseholder_name}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        {errors.destination_plot_id && <p className="mt-2 text-xs text-red-600">{errors.destination_plot_id}</p>}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 border-b border-slate-100 pb-3 font-semibold text-slate-900">Movement Details</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <DatePicker
                                label="Movement Date *"
                                disableFuture
                                value={data.movement_date}
                                onChange={(value) => setData('movement_date', value)}
                                error={errors.movement_date}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Reason *</label>
                                <Input
                                    value={data.reason}
                                    onChange={(event) => setData('reason', event.target.value)}
                                    placeholder="e.g. Family requested relocation"
                                />
                                {errors.reason && <p className="text-xs text-red-600">{errors.reason}</p>}
                                {errors.interment && <p className="text-xs text-red-600">{errors.interment}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Notes</label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    placeholder="Optional operational notes."
                                    className="min-h-24"
                                />
                                {errors.notes && <p className="text-xs text-red-600">{errors.notes}</p>}
                            </div>
                        </div>

                        {selectedPlot && (
                            <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950">
                                Moving to <span className="font-mono font-semibold">{selectedPlot.slot_label}</span> in{' '}
                                {sites.find((site) => site.id === selectedPlot.cemetery_site_id)?.name ?? 'selected site'}.
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                            <h2 className="font-semibold text-slate-900">Requesting Party / Authorization</h2>
                            <p className="text-sm text-slate-500">
                                Record who requested this movement. Leaseholder consent is checked against the destination plot first, then the
                                current plot if the destination has no active lease.
                            </p>
                        </div>

                        {consentTargetLease ? (
                            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950">
                                <p className="text-xs font-semibold tracking-wide uppercase">
                                    Consent Target:{' '}
                                    {consentTargetSource === 'destination plot' ? 'Destination Plot Leaseholder' : 'Current Plot Leaseholder'}
                                </p>
                                <p className="mt-1 font-medium">{consentTargetLease.leaseholder_name}</p>
                                <p className="mt-1 text-xs text-indigo-700">
                                    {consentTargetLease.leaseholder_contact ?? 'No contact recorded'}
                                    {consentTargetLease.leaseholder_relationship ? ` / ${consentTargetLease.leaseholder_relationship}` : ''}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">
                                No active leaseholder is recorded for the selected destination or current plot. Requester details are still saved for
                                the movement trail.
                            </div>
                        )}

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Requesting Party Name *</label>
                                <Input
                                    value={data.requesting_party_name}
                                    onChange={(event) => setData('requesting_party_name', event.target.value)}
                                    placeholder="e.g. JUAN DELA CRUZ"
                                    required
                                />
                                {errors.requesting_party_name && <p className="mt-1 text-xs text-red-600">{errors.requesting_party_name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Relationship / Role *</label>
                                <Input
                                    value={data.requesting_party_relationship}
                                    onChange={(event) => setData('requesting_party_relationship', event.target.value)}
                                    placeholder="e.g. SPOUSE, CHILD, AUTHORIZED REPRESENTATIVE"
                                    required
                                />
                                {errors.requesting_party_relationship && (
                                    <p className="mt-1 text-xs text-red-600">{errors.requesting_party_relationship}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Contact Number</label>
                                <Input
                                    value={data.requesting_party_contact}
                                    onChange={(event) => setData('requesting_party_contact', event.target.value)}
                                    placeholder="Optional"
                                />
                                {errors.requesting_party_contact && <p className="mt-1 text-xs text-red-600">{errors.requesting_party_contact}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                                <Input
                                    value={data.requesting_party_address}
                                    onChange={(event) => setData('requesting_party_address', event.target.value)}
                                    placeholder="Optional"
                                />
                                {errors.requesting_party_address && <p className="mt-1 text-xs text-red-600">{errors.requesting_party_address}</p>}
                            </div>
                        </div>

                        {consentTargetLease && (
                            <div className="mt-4 space-y-4">
                                <label className="flex items-start gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={data.requester_is_leaseholder}
                                        onChange={(event) =>
                                            setData({
                                                ...data,
                                                requester_is_leaseholder: event.target.checked,
                                                leaseholder_consent_confirmed: event.target.checked,
                                                leaseholder_consent_method: event.target.checked ? 'leaseholder_present' : '',
                                                leaseholder_consent_reference: '',
                                            })
                                        }
                                        className="mt-1"
                                    />
                                    <span>The requesting party is the consent-target leaseholder shown above.</span>
                                </label>

                                {needsLeaseholderConsent && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                        <h3 className="text-sm font-semibold text-amber-950">Leaseholder Authorization Required</h3>
                                        <p className="mt-1 text-sm text-amber-800">
                                            The requester is different from the consent-target leaseholder, so record how authorization was confirmed.
                                        </p>
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Consent Method *</label>
                                                <Select
                                                    value={data.leaseholder_consent_method}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'leaseholder_consent_method',
                                                            value as MoveIntermentForm['leaseholder_consent_method'],
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select consent method" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="leaseholder_present">Leaseholder Present</SelectItem>
                                                        <SelectItem value="verbal_authorization">Verbal Authorization</SelectItem>
                                                        <SelectItem value="written_authorization">Written Authorization</SelectItem>
                                                        <SelectItem value="family_attestation">Family Attestation</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.leaseholder_consent_method && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.leaseholder_consent_method}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-700">Consent Reference *</label>
                                                <Input
                                                    value={data.leaseholder_consent_reference}
                                                    onChange={(event) => setData('leaseholder_consent_reference', event.target.value)}
                                                    placeholder="e.g. SIGNED LETTER, CALL WITH ADMIN HEAD"
                                                    required
                                                />
                                                {errors.leaseholder_consent_reference && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.leaseholder_consent_reference}</p>
                                                )}
                                            </div>
                                        </div>
                                        <label className="mt-4 flex items-start gap-2 rounded border border-amber-200 bg-white px-3 py-2 text-xs text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={data.leaseholder_consent_confirmed}
                                                onChange={(event) => setData('leaseholder_consent_confirmed', event.target.checked)}
                                                required
                                                className="mt-0.5"
                                            />
                                            <span>I confirm that the consent-target leaseholder authorized this movement request.</span>
                                        </label>
                                        {errors.leaseholder_consent_confirmed && (
                                            <p className="mt-1 text-xs text-red-600">{errors.leaseholder_consent_confirmed}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Authorization Evidence</label>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={(event) => setData('authorization_evidence', event.target.files?.[0] ?? null)}
                                />
                                <p className="mt-1 text-xs text-slate-500">Optional JPG, PNG, WEBP, or PDF. Max 5 MB.</p>
                                {errors.authorization_evidence && <p className="mt-1 text-xs text-red-600">{errors.authorization_evidence}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Request Notes</label>
                                <Input
                                    value={data.service_request_notes}
                                    onChange={(event) => setData('service_request_notes', event.target.value)}
                                    placeholder="Optional requester/authorization notes"
                                />
                                {errors.service_request_notes && <p className="mt-1 text-xs text-red-600">{errors.service_request_notes}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href={backUrl}>Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.destination_plot_id ||
                                !data.movement_date ||
                                !data.reason.trim() ||
                                !requesterComplete ||
                                !leaseholderConsentComplete
                            }
                            className="bg-indigo-700 hover:bg-indigo-800"
                        >
                            {processing ? 'Moving...' : 'Confirm Move'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{value || '-'}</p>
        </div>
    );
}
