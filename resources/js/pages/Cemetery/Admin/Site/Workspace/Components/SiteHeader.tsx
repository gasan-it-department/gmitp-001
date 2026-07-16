import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CemeterySiteListItem, UpdateCemeterySiteForm } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import cemetery from '@/routes/cemetery';
import { Link, useForm } from '@inertiajs/react';
import { Building2, MapPin, Pencil, Plus } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

interface Props {
    site: CemeterySiteListItem;
    municipality: MunicipalityType;
}

const STATUS_CLASSES: Record<CemeterySiteListItem['status'], string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    inactive: 'bg-amber-50 text-amber-700 ring-amber-200',
    closed: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function SiteHeader({ site, municipality }: Props) {
    const active = site.status === 'active';

    return (
        <>
            <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600" />

                <div className="p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                <Building2 size={24} />
                            </span>
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{site.name}</h1>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_CLASSES[site.status]}`}
                                    >
                                        {site.status_label}
                                    </span>
                                </div>
                                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                    <MapPin className="h-4 w-4" />
                                    {formatAddress(site)}
                                </p>
                                {site.notes && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{site.notes}</p>}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <EditSiteDialog site={site} municipality={municipality} />
                            {active && (
                                <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                                    <Link
                                        href={cemetery.admin.sites.plots.create.page.url({
                                            municipality: municipality.slug,
                                            cemetery_site_id: site.id,
                                        })}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Register Plot
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {!active && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    This Site is <span className="font-semibold">{site.status}</span>. Historical inventory remains visible, but new Plots cannot be
                    registered.
                </div>
            )}
        </>
    );
}

function EditSiteDialog({ site, municipality }: { site: CemeterySiteListItem; municipality: MunicipalityType }) {
    const [open, setOpen] = useState(false);
    const form = useForm<UpdateCemeterySiteForm>({
        name: site.name,
        psgc_barangay_code: site.psgc_barangay_code ?? '',
        street_name: site.street_name ?? '',
        notes: site.notes ?? '',
    });

    const openDialog = () => {
        form.setData({
            name: site.name,
            psgc_barangay_code: site.psgc_barangay_code ?? '',
            street_name: site.street_name ?? '',
            notes: site.notes ?? '',
        });
        form.clearErrors();
        setOpen(true);
    };

    const close = () => {
        if (form.processing) return;

        form.reset();
        form.clearErrors();
        setOpen(false);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/api/cemetery-sites/${site.id}`, {
            headers: { 'X-Municipality-Slug': municipality.slug },
            preserveScroll: true,
            onSuccess: close,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" onClick={openDialog}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Site
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Cemetery Site</DialogTitle>
                    <DialogDescription>Update the site name, address, and notes. Site status changes are handled separately.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Cemetery Site Name" error={form.errors.name}>
                        <Input
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            placeholder="GASAN CENTRAL CEMETERY"
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <BarangaySelect
                                municipalityId={municipality.psgc_municipal_id ?? ''}
                                value={form.data.psgc_barangay_code}
                                onChange={(selection) => form.setData('psgc_barangay_code', selection.psgc_code)}
                                disabled={!municipality.psgc_municipal_id}
                            />
                            {form.errors.psgc_barangay_code && (
                                <p className="mt-1 text-xs font-medium text-red-600">{form.errors.psgc_barangay_code}</p>
                            )}
                            {!municipality.psgc_municipal_id && (
                                <p className="mt-1 text-xs text-amber-700">Configure the municipality PSGC reference before selecting a barangay.</p>
                            )}
                        </div>
                        <Field label="Street / Purok" error={form.errors.street_name}>
                            <Input
                                value={form.data.street_name}
                                onChange={(event) => form.setData('street_name', event.target.value)}
                                placeholder="PUROK 2"
                            />
                        </Field>
                    </div>

                    <Field label="Administrative Notes" error={form.errors.notes}>
                        <Textarea
                            value={form.data.notes}
                            onChange={(event) => form.setData('notes', event.target.value)}
                            placeholder="Optional operational notes about this cemetery site."
                            className="min-h-28"
                        />
                    </Field>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-emerald-700 hover:bg-emerald-800">
                            {form.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}
            <div className="mt-1.5">{children}</div>
            {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

function formatAddress(site: CemeterySiteListItem): string {
    const parts = [site.street_name, site.barangay_name].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No address recorded';
}
