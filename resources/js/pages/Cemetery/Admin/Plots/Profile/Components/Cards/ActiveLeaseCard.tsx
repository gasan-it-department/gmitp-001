import { CemeterySiteListItem, PlotProfile as PlotProfileType } from '@/Core/Types/Cemetery/cemetery';
import { MunicipalityType } from '@/Core/Types/Municipality/MunicipalityTypes';
import { Users } from 'lucide-react';
import { PlotLeaseDialog } from '../Dialogs/PlotLeaseDialog';
import { Detail, EmptyState, formatCurrency, formatDate } from '../Helpers';

export function ActiveLeaseCard({
    plot,
    municipality,
    site,
    canManageLease,
}: {
    plot: PlotProfileType;
    municipality: MunicipalityType;
    site: CemeterySiteListItem;
    canManageLease: boolean;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Active Lease / Responsible Person</h2>
                    <p className="text-sm text-slate-500">Plot-level leaseholder and manual payment information for this physical place.</p>
                </div>
                {canManageLease && <PlotLeaseDialog municipality={municipality} site={site} plot={plot} />}
            </div>

            {!plot.active_lease ? (
                <EmptyState icon={<Users size={20} />} text="No active lease is recorded for this plot yet." />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Detail label="Leaseholder" value={plot.active_lease.leaseholder_name} />
                    <Detail label="Relationship" value={plot.active_lease.leaseholder_relationship} />
                    <Detail label="Contact" value={plot.active_lease.leaseholder_contact} />
                    <Detail label="Address" value={plot.active_lease.leaseholder_address} />
                    <Detail label="Lease Start" value={formatDate(plot.active_lease.lease_start)} />
                    <Detail label="Lease End" value={formatDate(plot.active_lease.lease_end)} />
                    <Detail label="Amount Paid" value={formatCurrency(plot.active_lease.amount_paid)} />
                    <Detail label="OR Number" value={plot.active_lease.or_number} />
                    <div className="sm:col-span-2">
                        <Detail label="Notes" value={plot.active_lease.notes} />
                    </div>
                </div>
            )}
        </section>
    );
}
