import { BeneficiarySummary, HouseholdSummary } from '@/Core/Types/ActionCenter/assistance';
import { Link } from '@inertiajs/react';
import { Lock, User } from 'lucide-react';

interface Props {
    beneficiary: { data: BeneficiarySummary };
    household: { data: HouseholdSummary };
    editProfileUrl?: string;
}

/**
 * Read-only summary of the citizen's verified identity + address.
 * Pulled from ac_beneficiaries + ac_households on the server — the citizen
 * cannot edit these values inline. They follow the "Edit profile" link
 * to amend them.
 */
export function BeneficiaryInfoBlock({ beneficiary, household, editProfileUrl }: Props) {
    // Most-specific → least-specific. `municipality` arrives from the tenant
    // binding via HouseholdDetailsResource; province is omitted (not stored,
    // single-province deployment).
    const beneData = beneficiary.data;
    const householdData = household.data;
    const fullAddress = [householdData.street, householdData.barangay, householdData.municipality].filter(Boolean).join(', ');

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <User className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Your verified info</h2>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    <Lock className="h-3 w-3" /> Read-only
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Full name" value={beneData.full_name || '—'} />
                <Field label="Sex" value={beneData.sex ?? '—'} className="capitalize" />
                <Field label="Date of birth" value={beneData.birth_date ?? '—'} />
                <Field label="Home address" value={fullAddress || '—'} />
            </div>

            {editProfileUrl && (
                <p className="mt-6 text-xs text-slate-500">
                    Need to update your info?{' '}
                    <Link href={editProfileUrl} className="font-bold text-[#005088] underline-offset-2 hover:underline">
                        Edit profile
                    </Link>
                </p>
            )}
        </div>
    );
}

function Field({ label, value, className = '' }: { label: string; value: string; className?: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{label}</p>
            <p className={`mt-1 text-sm font-semibold text-slate-800 ${className}`}>{value}</p>
        </div>
    );
}
