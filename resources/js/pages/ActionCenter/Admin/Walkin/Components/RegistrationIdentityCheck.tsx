import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import ShowCreateHouseholdBeneficiaryController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Household/ShowCreateHouseholdBeneficiaryController';
import ShowHouseholdProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Household/ShowHouseholdProfileController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { useRef, useState } from 'react';

export type IdentityField = 'first_name' | 'middle_name' | 'last_name' | 'suffix' | 'birth_date';
export type RegistrationIdentity = Record<IdentityField, string>;

interface Candidate {
    key: string;
    record_type: 'beneficiary' | 'roster_only';
    match_type: 'exact' | 'possible';
    id: string;
    beneficiary_number: string | null;
    full_name: string;
    birth_date: string | null;
    household_id: string;
    household_code: string | null;
    barangay: string | null;
    relationship: string | null;
    can_reuse: boolean;
}

interface CheckResult {
    candidates: Candidate[];
    context: string;
}

interface Props {
    identity: RegistrationIdentity;
    onChange: (field: IdentityField, value: string) => void;
    onContinue: (context: string, reason: string | null) => void;
    checkUrl: string;
    municipalitySlug: string;
    canCorrect: boolean;
    destinationHouseholdId?: string;
    selectedMemberId?: string;
    submitError?: string;
}

export function RegistrationIdentityCheck({
    identity,
    onChange,
    onContinue,
    checkUrl,
    municipalitySlug,
    canCorrect,
    destinationHouseholdId,
    selectedMemberId,
    submitError,
}: Props) {
    const [result, setResult] = useState<CheckResult | null>(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [reason, setReason] = useState('');
    const requestVersion = useRef(0);

    const change = (field: IdentityField, value: string) => {
        requestVersion.current += 1;
        onChange(field, value);
        setResult(null);
        setChecking(false);
        setReason('');
        setError(null);
    };

    const check = async () => {
        const version = ++requestVersion.current;
        setChecking(true);
        setError(null);
        setResult(null);
        try {
            const response = await axios.post<CheckResult>(
                checkUrl,
                {
                    ...identity,
                    selected_member_id: selectedMemberId,
                    household_id: selectedMemberId ? destinationHouseholdId : undefined,
                },
                {
                    headers: { 'X-Municipality-Slug': municipalitySlug },
                },
            );
            if (version === requestVersion.current) setResult(response.data);
        } catch (failure) {
            if (version === requestVersion.current) {
                setError(
                    axios.isAxiosError(failure)
                        ? (failure.response?.data?.message ?? 'Could not check the registry.')
                        : 'Could not check the registry.',
                );
            }
        } finally {
            if (version === requestVersion.current) setChecking(false);
        }
    };

    const fields: Array<{ key: IdentityField; label: string; required?: boolean }> = [
        { key: 'first_name', label: 'First name', required: true },
        { key: 'middle_name', label: 'Middle name' },
        { key: 'last_name', label: 'Last name', required: true },
        { key: 'suffix', label: 'Suffix' },
        { key: 'birth_date', label: 'Date of birth', required: true },
    ];

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                void check();
            }}
            className="space-y-5 rounded-md border border-slate-200 bg-white p-4 sm:p-6"
        >
            <div>
                <h2 className="text-lg font-semibold text-slate-950">Check person</h2>
                <p className="mt-1 text-sm text-slate-600">Check the registry before creating a beneficiary profile.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                        <Label htmlFor={`check-${field.key}`}>
                            {field.label}
                            {field.required ? ' *' : ''}
                        </Label>
                        <Input
                            id={`check-${field.key}`}
                            type={field.key === 'birth_date' ? 'date' : 'text'}
                            value={identity[field.key]}
                            onChange={(event) => change(field.key, event.target.value)}
                            max={field.key === 'birth_date' ? new Date().toISOString().slice(0, 10) : undefined}
                        />
                    </div>
                ))}
            </div>
            <Button type="submit" disabled={checking || !identity.first_name.trim() || !identity.last_name.trim() || !identity.birth_date}>
                {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Check registry
            </Button>
            {(error || (!result && !checking && submitError)) && (
                <p role="alert" className="text-sm text-red-700">
                    {error || submitError}
                </p>
            )}

            {result && result.candidates.length === 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-700">
                        {selectedMemberId
                            ? 'Selected household member checked. No other possible match found.'
                            : 'No possible match found. Confirm the details before registering.'}
                    </p>
                    <Button type="button" onClick={() => onContinue(result.context, null)}>
                        Continue to registration <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}

            {result && result.candidates.length > 0 && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold text-amber-800">Possible existing records found. Review them before creating a profile.</p>
                    <ul className="divide-y divide-slate-200 border-y border-slate-200">
                        {result.candidates.map((candidate) => (
                            <li key={candidate.key} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 text-sm">
                                    <p className="font-semibold text-slate-950">{candidate.full_name}</p>
                                    <p className="text-slate-600">
                                        {candidate.match_type === 'exact' ? 'Same name and birth date' : 'Possible match'} ·{' '}
                                        {candidate.birth_date ?? 'Birth date not recorded'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {candidate.beneficiary_number ?? 'Household member'} · {candidate.household_code ?? 'No household code'} ·{' '}
                                        {candidate.barangay ?? 'No barangay'}
                                    </p>
                                </div>
                                {candidate.record_type === 'beneficiary' ? (
                                    <Link
                                        className="shrink-0 text-sm font-medium text-blue-700 hover:underline"
                                        href={ShowBeneficiaryProfileController.url({ municipality: municipalitySlug, beneficiaryId: candidate.id })}
                                    >
                                        Use existing beneficiary
                                    </Link>
                                ) : !candidate.can_reuse ? (
                                    <Link
                                        className="shrink-0 text-sm font-medium text-blue-700 hover:underline"
                                        href={ShowHouseholdProfileController.url({
                                            municipality: municipalitySlug,
                                            householdId: candidate.household_id,
                                        })}
                                    >
                                        Review household
                                    </Link>
                                ) : (
                                    <Link
                                        className="shrink-0 text-sm font-medium text-blue-700 hover:underline"
                                        href={`${ShowCreateHouseholdBeneficiaryController.url({ municipality: municipalitySlug, householdId: candidate.household_id })}?member_id=${encodeURIComponent(candidate.id)}`}
                                    >
                                        Register in this household
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                    {destinationHouseholdId &&
                        result.candidates.some(
                            (candidate) => candidate.record_type === 'beneficiary' && candidate.household_id !== destinationHouseholdId,
                        ) && (
                            <p className="text-sm text-slate-600">
                                To move an existing beneficiary here, use Add person → Existing beneficiary on the{' '}
                                <Link
                                    className="font-medium text-blue-700 hover:underline"
                                    href={ShowHouseholdProfileController.url({ municipality: municipalitySlug, householdId: destinationHouseholdId })}
                                >
                                    household profile
                                </Link>
                                .
                            </p>
                        )}
                    {canCorrect ? (
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(true)}>
                            Different person
                        </Button>
                    ) : (
                        <p className="text-sm text-amber-800">
                            A user with beneficiary correction permission must review a different-person registration.
                        </p>
                    )}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register a different person?</DialogTitle>
                        <DialogDescription>
                            These records are not the applicant. Record why before continuing. This decision will be audited.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="different-person-reason">Reason</Label>
                        <Textarea id="different-person-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} />
                        <p className="text-xs text-slate-500">10–1,000 characters</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={reason.trim().length < 10}
                            onClick={() => {
                                setDialogOpen(false);
                                if (result) onContinue(result.context, reason.trim());
                            }}
                        >
                            Continue to registration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
}
