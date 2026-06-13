import ReviewBeneficiaryIntakeController from '@/actions/App/External/Api/Controllers/ActionCenter/Beneficiary/ReviewBeneficiaryIntakeController';
import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Clock3, Home, Loader2, ShieldCheck } from 'lucide-react';
import type { HouseholdMemberRow } from './HouseholdMembersTable';

export interface HouseholdMatch {
    member_id: string;
    household_id: string;
    household_code: string | null;
    barangay: string | null;
    street: string | null;
    head_name: string | null;
}

interface Props {
    beneficiaryId: string;
    identityVerified: boolean;
    verifiedAt: string | null;
    verifiedBy: string | null;
    members: HouseholdMemberRow[];
    householdMatches: HouseholdMatch[];
}

type ReviewForm = {
    household_resolution: 'keep_existing' | 'join_existing';
    target_member_id: string;
    verified_member_ids: string[];
    rejected_member_ids: string[];
};

export default function IntakeReviewPanel({ beneficiaryId, identityVerified, verifiedAt, verifiedBy, members, householdMatches }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const dependents = members.filter((member) => member.is_active && member.relationship !== 'head');

    const { data, setData, post, processing, errors } = useForm<ReviewForm>({
        household_resolution: 'keep_existing',
        target_member_id: '',
        verified_member_ids: dependents.map((member) => member.id),
        rejected_member_ids: [],
    });

    if (identityVerified) {
        return (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                    <p className="text-sm font-semibold text-emerald-900">Identity verified</p>
                    <p className="mt-0.5 text-xs text-emerald-800">
                        {verifiedBy ? `Reviewed by ${verifiedBy}` : 'Reviewed by MSWD'}
                        {verifiedAt ? ` on ${new Date(verifiedAt).toLocaleDateString('en-PH')}` : ''}.
                    </p>
                </div>
            </div>
        );
    }

    const decide = (memberId: string, verify: boolean) => {
        if (verify) {
            setData((current) => ({
                ...current,
                verified_member_ids: [...current.verified_member_ids.filter((id) => id !== memberId), memberId],
                rejected_member_ids: current.rejected_member_ids.filter((id) => id !== memberId),
            }));
        } else {
            setData((current) => ({
                ...current,
                verified_member_ids: current.verified_member_ids.filter((id) => id !== memberId),
                rejected_member_ids: [...current.rejected_member_ids.filter((id) => id !== memberId), memberId],
            }));
        }
    };

    const submit = () => {
        post(ReviewBeneficiaryIntakeController.url({ beneficiaryId }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-5 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                    <h2 className="font-semibold text-amber-950">Pending beneficiary intake</h2>
                    <p className="mt-1 text-sm text-amber-800">
                        Check the claimant's ID, confirm where they actually live, and review every submitted dependent.
                    </p>
                </div>
            </div>

            <fieldset className="space-y-2">
                <legend className="text-xs font-bold tracking-wide text-amber-900 uppercase">Household resolution</legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-amber-200 bg-white px-3 py-2">
                    <input
                        type="radio"
                        name="household_resolution"
                        checked={data.household_resolution === 'keep_existing'}
                        onChange={() => setData({ ...data, household_resolution: 'keep_existing', target_member_id: '' })}
                        className="mt-1"
                    />
                    <span className="text-sm text-slate-800">
                        <strong>Keep separate household.</strong> Use this when the claimant does not currently live with a suggested relative.
                    </span>
                </label>

                {householdMatches.map((match) => (
                    <label
                        key={match.member_id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-amber-200 bg-white px-3 py-2"
                    >
                        <input
                            type="radio"
                            name="household_resolution"
                            checked={data.household_resolution === 'join_existing' && data.target_member_id === match.member_id}
                            onChange={() => setData({ ...data, household_resolution: 'join_existing', target_member_id: match.member_id })}
                            className="mt-1"
                        />
                        <Home className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        <span className="text-sm text-slate-800">
                            <strong>Join {match.head_name ? `${match.head_name}'s household` : 'matching household'}.</strong>{' '}
                            {[match.street, match.barangay].filter(Boolean).join(', ') || match.household_code || 'Address unavailable'}
                        </span>
                    </label>
                ))}
            </fieldset>

            <div className="space-y-2">
                <p className="text-xs font-bold tracking-wide text-amber-900 uppercase">Submitted dependents</p>
                {dependents.length === 0 ? (
                    <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-500">No other household members were submitted.</p>
                ) : (
                    dependents.map((member) => {
                        const verified = data.verified_member_ids.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-white px-3 py-2"
                            >
                                <div className="text-sm">
                                    <p className="font-medium text-slate-900">
                                        {member.first_name} {member.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500">{member.relationship}</p>
                                </div>
                                <div className="flex rounded-md border border-slate-200 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => decide(member.id, true)}
                                        className={`px-3 py-1 text-xs font-semibold ${verified ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                                    >
                                        Verify
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => decide(member.id, false)}
                                        className={`px-3 py-1 text-xs font-semibold ${!verified ? 'bg-rose-600 text-white' : 'text-slate-600'}`}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {(errors as Record<string, string | undefined>).intake && (
                <p className="text-sm font-medium text-rose-700">{(errors as Record<string, string | undefined>).intake}</p>
            )}

            <Button type="button" onClick={submit} disabled={processing} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Complete intake verification
            </Button>
        </div>
    );
}
