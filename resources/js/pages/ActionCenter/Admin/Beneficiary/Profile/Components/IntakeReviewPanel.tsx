import ReviewBeneficiaryIntakeController from '@/actions/App/External/Api/Controllers/ActionCenter/Beneficiary/ReviewBeneficiaryIntakeController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Clock3, ExternalLink, FileText, Home, Info, Loader2, OctagonX, Search, ShieldCheck, UserRoundSearch } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { HouseholdMemberRow } from './HouseholdMembersTable';

export interface HouseholdMatch {
    member_id: string;
    household_id: string;
    household_code: string | null;
    barangay: string | null;
    street: string | null;
    head_name: string | null;
    head_beneficiary_id?: string | null;
    member_name?: string;
    birth_date?: string | null;
    relationship?: string | null;
    is_exact_match?: boolean;
}

interface Props {
    beneficiaryId: string;
    identityVerified: boolean;
    verifiedAt: string | null;
    verifiedBy: string | null;
    intakeStatus: 'pending' | 'verified' | 'rejected';
    canRejectIntake: boolean;
    rejectedAt: string | null;
    rejectedBy: string | null;
    rejectionReason: string | null;
    identityDocuments: IdentityDocuments;
    members: HouseholdMemberRow[];
    householdMatches: HouseholdMatch[];
}

export interface IdentityDocuments {
    front: string | null;
    back: string | null;
}

type ReviewForm = {
    household_resolution: 'keep_existing' | 'join_existing';
    target_member_id: string;
    household_resolution_reason: string;
    verified_member_ids: string[];
    rejected_member_ids: string[];
};

type RejectForm = {
    reason: string;
};

export default function IntakeReviewPanel({
    beneficiaryId,
    identityVerified,
    verifiedAt,
    verifiedBy,
    intakeStatus,
    canRejectIntake,
    rejectedAt,
    rejectedBy,
    rejectionReason,
    identityDocuments,
    members,
    householdMatches,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const dependents = members.filter((member) => member.is_active && member.relationship !== 'head');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchResults, setSearchResults] = useState<HouseholdMatch[]>([]);
    const [manualSelection, setManualSelection] = useState<HouseholdMatch | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm<ReviewForm>({
        household_resolution: 'keep_existing',
        target_member_id: '',
        household_resolution_reason: '',
        verified_member_ids: dependents.map((member) => member.id),
        rejected_member_ids: [],
    });

    const {
        data: rejectData,
        setData: setRejectData,
        post: postReject,
        processing: rejecting,
        errors: rejectErrors,
        reset: resetReject,
    } = useForm<RejectForm>({
        reason: '',
    });

    if (intakeStatus === 'verified' || identityVerified) {
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

    if (intakeStatus === 'rejected') {
        return (
            <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-5">
                <div className="flex items-start gap-3">
                    <OctagonX className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                    <div>
                        <h2 className="font-semibold text-rose-950">Beneficiary intake rejected</h2>
                        <p className="mt-1 text-sm text-rose-800">
                            {rejectedBy ? `Reviewed by ${rejectedBy}` : 'Reviewed by MSWD'}
                            {rejectedAt ? ` on ${new Date(rejectedAt).toLocaleDateString('en-PH')}` : ''}.
                        </p>
                    </div>
                </div>

                <div className="rounded-md border border-rose-200 bg-white px-3 py-2">
                    <p className="text-xs font-bold tracking-wide text-rose-900 uppercase">Reason</p>
                    <p className="mt-1 text-sm text-slate-800">{rejectionReason || 'No rejection reason recorded.'}</p>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold tracking-wide text-rose-900 uppercase">Identity documents</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <IdentityDocumentLink label="ID front" href={identityDocuments.front} required />
                        <IdentityDocumentLink label="ID back" href={identityDocuments.back} />
                    </div>
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

    const rejectIntake = () => {
        postReject(`/api/action-center/beneficiary/${beneficiaryId}/reject-intake`, {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => {
                resetReject();
                setRejectOpen(false);
            },
        });
    };

    const keepProvisionalHousehold = () => {
        setManualSelection(null);
        setData((current) => ({
            ...current,
            household_resolution: 'keep_existing',
            target_member_id: '',
            household_resolution_reason: '',
        }));
    };

    const joinHousehold = (match: HouseholdMatch, manual: boolean) => {
        setManualSelection(manual ? match : null);
        setData((current) => ({
            ...current,
            household_resolution: 'join_existing',
            target_member_id: match.member_id,
            household_resolution_reason: '',
        }));
        setSearchOpen(false);
    };

    const searchHouseholds = async (event: FormEvent) => {
        event.preventDefault();
        const query = searchTerm.trim();

        if (query.length < 2) {
            setSearchError('Enter at least two characters.');
            return;
        }

        setSearching(true);
        setSearchError('');

        try {
            const response = await fetch(`/api/action-center/beneficiary/${beneficiaryId}/household-members/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Municipality-Slug': currentMunicipality.slug,
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const payload = (await response.json()) as { data: HouseholdMatch[] };
            setSearchResults(payload.data);
        } catch {
            setSearchError('Unable to search households right now. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const hasResolutionChoices = householdMatches.length > 0 || manualSelection !== null;
    const selectedMatch = manualSelection ?? householdMatches.find((match) => match.member_id === data.target_member_id) ?? null;
    const manualReasonRequired = manualSelection !== null && !manualSelection.is_exact_match;

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

            <div className="space-y-2">
                <p className="text-xs font-bold tracking-wide text-amber-900 uppercase">Identity documents</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <IdentityDocumentLink label="ID front" href={identityDocuments.front} required />
                    <IdentityDocumentLink label="ID back" href={identityDocuments.back} />
                </div>
            </div>

            <fieldset className="space-y-2">
                <legend className="text-xs font-bold tracking-wide text-amber-900 uppercase">Household resolution</legend>
                {hasResolutionChoices ? (
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-amber-200 bg-white px-3 py-2">
                        <input
                            type="radio"
                            name="household_resolution"
                            checked={data.household_resolution === 'keep_existing'}
                            onChange={keepProvisionalHousehold}
                            className="mt-1"
                        />
                        <span className="text-sm text-slate-800">
                            <strong>Keep claimant's provisional household.</strong> Use this when the claimant maintains a separate residence.
                        </span>
                    </label>
                ) : (
                    <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-white px-3 py-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                        <span className="text-sm text-slate-700">
                            <strong>No exact household match found.</strong> The provisional household will be retained unless you locate an existing
                            roster entry.
                        </span>
                    </div>
                )}

                {householdMatches.map((match) => (
                    <label
                        key={match.member_id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-amber-200 bg-white px-3 py-2"
                    >
                        <input
                            type="radio"
                            name="household_resolution"
                            checked={data.household_resolution === 'join_existing' && data.target_member_id === match.member_id}
                            onChange={() => joinHousehold(match, false)}
                            className="mt-1"
                        />
                        <Home className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        <span className="text-sm text-slate-800">
                            <strong>Join {match.head_name ? `${match.head_name}'s household` : 'matching household'}.</strong>{' '}
                            {[match.street, match.barangay].filter(Boolean).join(', ') || match.household_code || 'Address unavailable'}
                        </span>
                    </label>
                ))}

                {manualSelection && !householdMatches.some((match) => match.member_id === manualSelection.member_id) && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-sky-300 bg-sky-50 px-3 py-2">
                        <input
                            type="radio"
                            name="household_resolution"
                            checked={data.household_resolution === 'join_existing' && data.target_member_id === manualSelection.member_id}
                            onChange={() => joinHousehold(manualSelection, true)}
                            className="mt-1"
                        />
                        <Home className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                        <span className="text-sm text-slate-800">
                            <strong>Join {manualSelection.head_name ? `${manualSelection.head_name}'s household` : 'selected household'}.</strong>{' '}
                            Manual roster match: {manualSelection.member_name ?? 'Unnamed member'}.
                        </span>
                    </label>
                )}

                <Button type="button" variant="outline" size="sm" onClick={() => setSearchOpen(true)} className="border-amber-300 bg-white">
                    <UserRoundSearch className="mr-2 h-4 w-4" />
                    Find another household
                </Button>

                {manualReasonRequired && selectedMatch && (
                    <div className="space-y-1.5">
                        <label htmlFor="household-resolution-reason" className="text-xs font-semibold text-slate-700">
                            Manual match reason
                        </label>
                        <Textarea
                            id="household-resolution-reason"
                            value={data.household_resolution_reason}
                            onChange={(event) => setData('household_resolution_reason', event.target.value)}
                            placeholder="Explain how the interview or documents confirmed this roster member is the claimant."
                            rows={3}
                        />
                        <p className="text-xs text-amber-800">
                            Required because the selected roster entry is not an exact name and birth-date match.
                        </p>
                    </div>
                )}
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

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                <Button type="button" onClick={submit} disabled={processing || rejecting} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                    {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                    Complete intake verification
                </Button>
                {canRejectIntake && (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing || rejecting}
                        onClick={() => setRejectOpen(true)}
                        className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                        <OctagonX className="mr-2 h-4 w-4" />
                        Reject intake
                    </Button>
                )}
            </div>

            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Find an existing household member</DialogTitle>
                        <DialogDescription>
                            Search within this municipality by member, household head, household code, beneficiary number, or address.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={searchHouseholds} className="flex gap-2">
                        <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Pedro Cruz, GAS-000123, household code, or barangay"
                            autoFocus
                        />
                        <Button type="submit" disabled={searching} aria-label="Search households">
                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </form>

                    {searchError && <p className="text-sm font-medium text-rose-700">{searchError}</p>}

                    <div className="space-y-2">
                        {searchResults.map((match) => (
                            <button
                                key={match.member_id}
                                type="button"
                                onClick={() => joinHousehold(match, true)}
                                className="flex w-full items-start justify-between gap-4 rounded-md border border-slate-200 px-3 py-3 text-left hover:border-sky-400 hover:bg-sky-50"
                            >
                                <span>
                                    <span className="block text-sm font-semibold text-slate-900">{match.member_name}</span>
                                    <span className="block text-xs text-slate-600">
                                        {[match.relationship, match.birth_date].filter(Boolean).join(' · ') || 'Roster details unavailable'}
                                    </span>
                                    <span className="mt-1 block text-xs text-slate-500">
                                        {match.head_name ? `${match.head_name}'s household` : match.household_code || 'Household'} ·{' '}
                                        {[match.street, match.barangay].filter(Boolean).join(', ') || 'Address unavailable'}
                                    </span>
                                </span>
                                <span className={`shrink-0 text-xs font-semibold ${match.is_exact_match ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {match.is_exact_match ? 'Exact match' : 'Review required'}
                                </span>
                            </button>
                        ))}

                        {!searching && searchTerm.trim().length >= 2 && searchResults.length === 0 && !searchError && (
                            <p className="rounded-md bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">No unlinked roster members found.</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setSearchOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Reject beneficiary intake</DialogTitle>
                        <DialogDescription>
                            Reject only when the claimant profile itself cannot be verified. Use dependent Reject for family-member issues.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label htmlFor="intake-rejection-reason" className="text-xs font-semibold text-slate-700">
                            Rejection reason
                        </label>
                        <Textarea
                            id="intake-rejection-reason"
                            value={rejectData.reason}
                            onChange={(event) => setRejectData('reason', event.target.value)}
                            placeholder="Example: Uploaded ID does not match the claimant, claimant is not an actual resident, or submitted identity cannot be verified."
                            rows={4}
                        />
                        {(rejectErrors.reason || (rejectErrors as Record<string, string | undefined>).intake_rejection) && (
                            <p className="text-sm font-medium text-rose-700">
                                {rejectErrors.reason || (rejectErrors as Record<string, string | undefined>).intake_rejection}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setRejectOpen(false)} disabled={rejecting}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={rejectIntake}
                            disabled={rejecting || rejectData.reason.trim().length < 10}
                            className="bg-rose-700 text-white hover:bg-rose-800"
                        >
                            {rejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject intake
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function IdentityDocumentLink({ label, href, required = false }: { label: string; href: string | null; required?: boolean }) {
    if (!href) {
        return (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800">
                <FileText className="h-4 w-4 shrink-0" />
                <span>{required ? `${label} missing` : `${label} not uploaded`}</span>
            </div>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-amber-300 hover:bg-amber-100"
        >
            <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-amber-700" />
                View {label}
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
        </a>
    );
}
