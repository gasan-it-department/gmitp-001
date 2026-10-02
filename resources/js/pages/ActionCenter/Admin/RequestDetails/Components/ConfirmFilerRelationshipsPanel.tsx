import ConfirmAssistanceFilerRelationshipsController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ConfirmAssistanceFilerRelationshipsController';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { RelationshipOption } from '@/Core/Types/ActionCenter/assistance';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface FilerRelationshipStatus {
    answers: Record<string, string>;
    saved_answers: Record<string, string>;
    is_head_filer: boolean;
    is_current: boolean;
    is_confirmed: boolean;
    is_legacy: boolean;
    roster_fingerprint: string;
    filer_member_id: string | null;
    assisted_member_id: string | null;
    assisted_relationship_values: string[];
    off_roster_assisted_member_id: string | null;
    off_roster_assisted_name: string | null;
    off_roster_assisted_relationship: string | null;
}

interface Member {
    household_member_id: string | null;
    full_name: string;
    relationship: string | null;
}

export default function ConfirmFilerRelationshipsPanel({
    requestId,
    municipalitySlug,
    filerName,
    members,
    status,
    options,
    canConfirm,
    completedVerification,
    activeDisbursement,
}: {
    requestId: string;
    municipalitySlug: string;
    filerName: string;
    members: Member[];
    status: FilerRelationshipStatus;
    options: RelationshipOption[];
    canConfirm: boolean;
    completedVerification: boolean;
    activeDisbursement: boolean;
}) {
    const otherMembers = members.filter((member) => member.household_member_id && member.household_member_id !== status.filer_member_id);
    const offRosterId = status.off_roster_assisted_member_id;
    const [answers, setAnswers] = useState<Record<string, string>>(() => {
        const ids = status.is_head_filer ? [] : otherMembers.map((member) => member.household_member_id!);
        if (offRosterId) ids.push(offRosterId);
        return Object.fromEntries(
            ids
                .map((id) => {
                    const value =
                        status.answers[id] ?? status.saved_answers[id] ?? (id === offRosterId ? status.off_roster_assisted_relationship : null);
                    return [
                        id,
                        value && (id !== status.assisted_member_id || status.assisted_relationship_values.includes(value)) ? value : null,
                    ] as const;
                })
                .filter((entry): entry is readonly [string, string] => !!entry[1]),
        );
    });
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const allAnswered =
        (status.is_head_filer || otherMembers.every((member) => !!answers[member.household_member_id!])) && (!offRosterId || !!answers[offRosterId]);
    const hasChanges =
        !status.is_confirmed ||
        otherMembers.some((member) => answers[member.household_member_id!] !== status.answers[member.household_member_id!]) ||
        (!!offRosterId && answers[offRosterId] !== status.answers[offRosterId]);

    const confirm = () => {
        setError(null);
        router.post(
            ConfirmAssistanceFilerRelationshipsController.url({ assistanceRequestId: requestId }),
            {
                roster_fingerprint: status.roster_fingerprint,
                filer_relationships: answers,
                correction_reason: completedVerification ? reason : null,
            },
            {
                headers: { 'X-Municipality-Slug': municipalitySlug },
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onError: (errors) => setError(errors.filer_relationships ?? 'Review the household relationships and try again.'),
            },
        );
    };

    return (
        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Relationships to the filer</h3>
                <span className={`text-xs font-medium ${status.is_confirmed ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {status.is_confirmed ? 'MSWD confirmed' : status.is_legacy ? 'Not captured for this request' : 'Pending MSWD confirmation'}
                </span>
            </div>
            {!status.is_current && !status.is_legacy && (
                <p className="text-xs text-amber-700">The saved roster changed. Review every relationship again.</p>
            )}
            {status.is_head_filer && (
                <p className="text-xs text-slate-600">The filer is the household head. These values come from the saved roster.</p>
            )}
            {!status.is_head_filer &&
                otherMembers.map((member) => {
                    const id = member.household_member_id!;
                    const value = answers[id] ?? '';
                    return (
                        <div key={id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)] sm:items-center">
                            <Label className="text-xs">
                                Relationship of {member.full_name} to {filerName}
                            </Label>
                            {canConfirm && !activeDisbursement ? (
                                <Select value={value} onValueChange={(next) => setAnswers((current) => ({ ...current, [id]: next }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose relationship" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 overflow-y-auto">
                                        {options
                                            .filter(
                                                (option) =>
                                                    id !== status.assisted_member_id || status.assisted_relationship_values.includes(option.value),
                                            )
                                            .map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <span className="text-sm text-slate-700">
                                    {options.find((option) => option.value === value)?.label ?? 'Not recorded'}
                                </span>
                            )}
                        </div>
                    );
                })}
            {offRosterId && (
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                        Relationship of {status.off_roster_assisted_name || 'the assisted person'} to {filerName}
                    </Label>
                    <p className="text-xs text-slate-600">
                        Deceased assisted person; retained on this request but not in the assessed active household.
                    </p>
                    {canConfirm && !activeDisbursement ? (
                        <Select
                            value={answers[offRosterId] ?? ''}
                            onValueChange={(value) => setAnswers((current) => ({ ...current, [offRosterId]: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose relationship to filer" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 overflow-y-auto">
                                {options
                                    .filter((option) => status.assisted_relationship_values.includes(option.value))
                                    .map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <span className="text-sm text-slate-700">
                            {options.find((option) => option.value === answers[offRosterId])?.label ?? 'Not recorded'}
                        </span>
                    )}
                </div>
            )}
            {canConfirm &&
                (activeDisbursement ? (
                    <p className="text-xs text-amber-700">Void the active disbursement before correcting these relationships.</p>
                ) : (
                    <div className="space-y-2">
                        {completedVerification && (
                            <div className="space-y-1">
                                <Label className="text-xs">Correction reason</Label>
                                <Textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} />
                            </div>
                        )}
                        {error && <p className="text-xs text-red-600">{error}</p>}
                        <Button
                            type="button"
                            size="sm"
                            disabled={saving || !allAnswered || !hasChanges || (completedVerification && reason.trim().length < 10)}
                            onClick={confirm}
                        >
                            {completedVerification ? 'Correct relationships and reopen verification' : 'Confirm relationships after interview'}
                        </Button>
                    </div>
                ))}
        </div>
    );
}
