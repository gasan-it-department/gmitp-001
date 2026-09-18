import ReassignBeneficiaryHouseholdController from '@/actions/App/External/Api/Controllers/ActionCenter/Beneficiary/ReassignBeneficiaryHouseholdController';
import GetHouseholdTransferContextController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/GetHouseholdTransferContextController';
import SearchHouseholdBeneficiaryCandidatesController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/SearchHouseholdBeneficiaryCandidatesController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, Loader2, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { ShadcnSelectField } from '../../../Client/Apply/Beneficiary/Components/ShadcnSelectField';
import type { RelationshipOption } from '../../Beneficiary/Profile/Components/MemberFormDialog';

interface Candidate {
    id: string;
    beneficiary_number: string | null;
    full_name: string;
    birth_date: string | null;
    is_active: boolean;
    current_household_id: string;
    current_household_code: string | null;
    current_household_address: string;
    current_head_name: string | null;
    current_relationship: string | null;
    already_in_destination: boolean;
}

interface TransferContext {
    beneficiary: { id: string; beneficiary_number: string | null; full_name: string };
    source_household: { id: string; household_code: string | null };
    destination_household: { id: string; household_code: string | null };
    already_in_destination: boolean;
    source_is_head: boolean;
    successors: Array<{ id: string; full_name: string; relationship: string; reason: string | null }>;
    destination_member_id: string | null;
    destination_member_relationship: string | null;
}

interface Props {
    open: boolean;
    onClose: () => void;
    householdId: string;
    canVerify: boolean;
    relationships: RelationshipOption[];
}

export default function TransferBeneficiaryIntoHouseholdDialog({ open, onClose, householdId, canVerify, relationships }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [query, setQuery] = useState('');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [context, setContext] = useState<TransferContext | null>(null);
    const [searching, setSearching] = useState(false);
    const [loadingContext, setLoadingContext] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [operation, setOperation] = useState<'transfer' | 'correction'>('transfer');
    const [relationship, setRelationship] = useState('');
    const [reason, setReason] = useState('');
    const [successorId, setSuccessorId] = useState('');
    const [placeOnHold, setPlaceOnHold] = useState(false);
    const [verifyAtDestination, setVerifyAtDestination] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setQuery('');
        setCandidates([]);
        setContext(null);
        setOperation('transfer');
        setRelationship('');
        setReason('');
        setSuccessorId('');
        setPlaceOnHold(false);
        setVerifyAtDestination(false);
        setError('');
    };

    const close = () => {
        if (processing) return;
        reset();
        onClose();
    };

    const search = async (event: FormEvent) => {
        event.preventDefault();
        if (query.trim().length < 3) return;
        setSearching(true);
        setError('');
        setContext(null);
        try {
            const response = await axios.get(SearchHouseholdBeneficiaryCandidatesController.url({ householdId }), {
                params: { q: query.trim() },
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            });
            setCandidates(response.data.data ?? []);
        } catch {
            setCandidates([]);
            setError('Unable to search the beneficiary registry.');
        } finally {
            setSearching(false);
        }
    };

    const choose = async (candidate: Candidate) => {
        if (candidate.already_in_destination) {
            setContext(null);
            setError(`${candidate.full_name} is already an active member of this household.`);
            return;
        }

        setLoadingContext(true);
        setError('');
        try {
            const response = await axios.get(GetHouseholdTransferContextController.url({ householdId, beneficiaryId: candidate.id }), {
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            });
            setContext(response.data.data);
            setRelationship(response.data.data.destination_member_relationship ?? '');
        } catch (requestError) {
            setContext(null);
            setError(
                axios.isAxiosError(requestError)
                    ? (requestError.response?.data?.message ?? 'Unable to prepare the transfer.')
                    : 'Unable to prepare the transfer.',
            );
        } finally {
            setLoadingContext(false);
        }
    };

    const submit = () => {
        if (!context) return;
        if (!context.destination_member_id && !relationship) {
            setError('Select the relationship to the destination household head.');
            return;
        }
        if (reason.trim().length < 5) {
            setError('Enter a reason with at least 5 characters.');
            return;
        }
        if (context.source_is_head && !successorId && !placeOnHold) {
            setError('Choose a successor or place the source household on hold.');
            return;
        }

        setProcessing(true);
        setError('');
        router.post(
            ReassignBeneficiaryHouseholdController.url({ beneficiaryId: context.beneficiary.id }),
            {
                operation,
                reason: reason.trim(),
                destination_household_id: householdId,
                destination_member_id: context.destination_member_id ?? undefined,
                destination_relationship: context.destination_member_id ? undefined : relationship,
                verify_at_destination: canVerify && verifyAtDestination,
                successor_member_id: successorId || undefined,
                place_household_on_hold: placeOnHold,
            },
            {
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                preserveScroll: true,
                onSuccess: close,
                onError: (errors) => setError(String(errors.beneficiary ?? 'Unable to transfer the beneficiary.')),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const nonHeadRelationships = relationships.filter((option) => option.value !== 'head');
    const eligibleSuccessors = context?.successors.filter((successor) => successor.reason === null) ?? [];

    return (
        <Dialog open={open} onOpenChange={(next) => !next && close()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add existing beneficiary</DialogTitle>
                    <DialogDescription>Search the registry and complete a reviewed transfer into this household.</DialogDescription>
                </DialogHeader>

                {!context ? (
                    <div className="space-y-4">
                        <form onSubmit={search} className="flex gap-2">
                            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or beneficiary number" />
                            <Button type="submit" variant="secondary" disabled={searching || query.trim().length < 3}>
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                <span className="sr-only">Search</span>
                            </Button>
                        </form>
                        <div className="max-h-72 space-y-2 overflow-y-auto">
                            {candidates.map((candidate) => (
                                <button
                                    key={candidate.id}
                                    type="button"
                                    onClick={() => choose(candidate)}
                                    disabled={loadingContext}
                                    className="flex w-full items-start justify-between gap-3 rounded-md border border-slate-200 p-3 text-left hover:bg-slate-50 disabled:opacity-60"
                                >
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-900">{candidate.full_name}</span>
                                        <span className="mt-1 block text-xs text-slate-500">
                                            {candidate.beneficiary_number ?? 'No beneficiary number'} ·{' '}
                                            {candidate.current_household_code ?? 'No household code'}
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            {candidate.current_household_address || 'Address unavailable'}
                                        </span>
                                    </span>
                                    {candidate.already_in_destination && (
                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-800">
                                            Already a member
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                            <p className="text-sm font-semibold text-slate-900">{context.beneficiary.full_name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                                {context.source_household.household_code ?? 'Current household'} to{' '}
                                {context.destination_household.household_code ?? 'this household'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Transfer type</Label>
                            <RadioGroup
                                value={operation}
                                onValueChange={(value) => setOperation(value as 'transfer' | 'correction')}
                                className="grid gap-2 sm:grid-cols-2"
                            >
                                <Label className="flex items-center gap-2 rounded-md border p-3">
                                    <RadioGroupItem value="transfer" /> Residence transfer
                                </Label>
                                <Label className="flex items-center gap-2 rounded-md border p-3">
                                    <RadioGroupItem value="correction" /> Correct assignment
                                </Label>
                            </RadioGroup>
                        </div>

                        {context.destination_member_id ? (
                            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                                An existing matching roster row will be reused with its saved relationship.
                            </div>
                        ) : (
                            <ShadcnSelectField
                                id="destination_relationship"
                                label="Relationship to household head"
                                required
                                value={relationship}
                                onValueChange={setRelationship}
                                options={nonHeadRelationships.map((option) => ({ value: option.value, label: option.label }))}
                                contentClassName="max-h-64"
                            />
                        )}

                        {context.source_is_head && (
                            <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                                    <AlertTriangle className="h-4 w-4" /> Source household head
                                </p>
                                <RadioGroup
                                    value={successorId}
                                    onValueChange={(value) => {
                                        setSuccessorId(value);
                                        setPlaceOnHold(false);
                                    }}
                                >
                                    {eligibleSuccessors.map((successor) => (
                                        <Label key={successor.id} className="flex items-center gap-2 rounded-md border border-amber-200 bg-white p-3">
                                            <RadioGroupItem value={successor.id} /> {successor.full_name}
                                        </Label>
                                    ))}
                                </RadioGroup>
                                <Label className="flex items-center gap-2 text-sm text-amber-900">
                                    <Checkbox
                                        checked={placeOnHold}
                                        onCheckedChange={(checked) => {
                                            setPlaceOnHold(Boolean(checked));
                                            if (checked) setSuccessorId('');
                                        }}
                                    />
                                    Place the source household on hold
                                </Label>
                            </div>
                        )}

                        {canVerify && (
                            <Label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={verifyAtDestination} onCheckedChange={(checked) => setVerifyAtDestination(Boolean(checked))} />
                                Verify the destination relationship now
                            </Label>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="transfer_reason">Reason</Label>
                            <Textarea id="transfer_reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} />
                        </div>
                    </div>
                )}

                {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                <DialogFooter>
                    {context && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setContext(null);
                                setError('');
                            }}
                        >
                            Back
                        </Button>
                    )}
                    <Button type="button" variant="outline" onClick={close} disabled={processing}>
                        Cancel
                    </Button>
                    {context && (
                        <Button type="button" onClick={submit} disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirm transfer
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
