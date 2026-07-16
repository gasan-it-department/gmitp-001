import ChangeHouseholdHeadController from '@/actions/App/External/Api/Controllers/ActionCenter/Household/ChangeHouseholdHeadController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { HouseholdMemberRow } from './HouseholdMembersTable';
import type { RelationshipOption } from './MemberFormDialog';

const HOLD = '__hold__';

interface HouseholdHeadState {
    current_head_member_id: string | null;
    profile_is_current_head: boolean;
    household_on_hold: boolean;
    candidate_reasons: Record<string, string | null>;
}

interface Props {
    open: boolean;
    onClose: () => void;
    householdId: string;
    members: HouseholdMemberRow[];
    headState: HouseholdHeadState;
    relationships: RelationshipOption[];
    headDispositions: { value: string; label: string }[];
}

export type { HouseholdHeadState };

export default function ChangeHouseholdHeadDialog({ open, onClose, householdId, members, headState, relationships, headDispositions }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [successorId, setSuccessorId] = useState(HOLD);
    const [disposition, setDisposition] = useState('');
    const [formerRelationship, setFormerRelationship] = useState('');
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentHead = members.find((member) => member.id === headState.current_head_member_id);
    const eligible = useMemo(
        () => members.filter((member) => member.id !== currentHead?.id && headState.candidate_reasons[member.id] === null),
        [currentHead?.id, headState.candidate_reasons, members],
    );
    const ineligible = useMemo(
        () => members.filter((member) => member.id !== currentHead?.id && headState.candidate_reasons[member.id]),
        [currentHead?.id, headState.candidate_reasons, members],
    );

    const resetAndClose = () => {
        setSuccessorId(HOLD);
        setDisposition('');
        setFormerRelationship('');
        setReason('');
        setError(null);
        onClose();
    };

    const submit = () => {
        if (currentHead && !disposition) {
            setError('Choose what happened to the current head.');
            return;
        }
        if (disposition === 'remains_member' && !formerRelationship) {
            setError("Choose the former head's relationship to the new head.");
            return;
        }
        if (disposition === 'remains_member' && successorId === HOLD) {
            setError('Select a new head when the current head remains in the household.');
            return;
        }
        if (reason.trim().length < 5) {
            setError('Enter a short reason for this household change.');
            return;
        }

        setError(null);
        router.post(
            ChangeHouseholdHeadController.url({ householdId }),
            {
                successor_member_id: successorId === HOLD ? null : successorId,
                current_head_disposition: currentHead ? disposition : null,
                former_head_relationship: disposition === 'remains_member' ? formerRelationship : null,
                reason: reason.trim(),
            },
            {
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onError: (errors) => setError(String(errors.household_head ?? 'Unable to update the household head.')),
                onSuccess: resetAndClose,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && !processing && resetAndClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{headState.household_on_hold ? 'Assign Head of Household' : 'Change Head of Household'}</DialogTitle>
                    <DialogDescription>This changes the authoritative household roster and is recorded in the audit log.</DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {currentHead && (
                        <div className="space-y-2">
                            <Label>Current head</Label>
                            <p className="text-sm font-semibold text-slate-800">{fullName(currentHead)}</p>
                            <Select value={disposition} onValueChange={setDisposition}>
                                <SelectTrigger>
                                    <SelectValue placeholder="What happened to the current head?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {headDispositions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {disposition === 'remains_member' && (
                        <div className="space-y-2">
                            <Label>Former head's relationship to the new head</Label>
                            <Select value={formerRelationship} onValueChange={setFormerRelationship}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    {relationships.map((relationship) => (
                                        <SelectItem key={relationship.value} value={relationship.value}>
                                            {relationship.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>New head</Label>
                        <Select value={successorId} onValueChange={setSuccessorId}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={HOLD}>No successor yet - place household on hold</SelectItem>
                                {eligible.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {fullName(member)} ({member.age} yrs)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                            A successor must be active, relationship-verified, at least 18, and linked to an identity-verified beneficiary whose
                            primary household is this one.
                        </p>
                    </div>

                    {ineligible.length > 0 && (
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-xs font-semibold text-slate-700">Members not yet eligible</p>
                            <ul className="mt-1 space-y-1 text-xs text-slate-500">
                                {ineligible.map((member) => (
                                    <li key={member.id}>
                                        {fullName(member)}: {headState.candidate_reasons[member.id]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {successorId === HOLD && (
                        <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            New assistance applications will be blocked until an eligible head is assigned.
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="head-change-reason">Reason</Label>
                        <Textarea
                            id="head-change-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Record the interview finding or supporting document."
                            maxLength={500}
                        />
                    </div>

                    {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetAndClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={submit} disabled={processing}>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm household change
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function fullName(member: HouseholdMemberRow): string {
    return [member.first_name, member.middle_name, member.last_name, member.suffix].filter(Boolean).join(' ');
}
