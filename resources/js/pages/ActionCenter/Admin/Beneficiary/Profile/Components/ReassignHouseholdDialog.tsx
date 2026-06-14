import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, Loader2, Wrench, Home, DoorOpen } from 'lucide-react';
import { useState, useMemo, FormEvent } from 'react';
import type { HouseholdMemberRow } from './HouseholdMembersTable';
import type { HouseholdHeadState } from './ChangeHouseholdHeadDialog';
import { BarangaySelect } from '@/components/Shared/BarangaySelect';
import axios from 'axios';

type Operation = 'correction' | 'transfer' | 'move_out';
type DestinationType = 'join' | 'create';

interface Props {
    open: boolean;
    onClose: () => void;
    beneficiaryId: string;
    members: HouseholdMemberRow[];
    headState: HouseholdHeadState;
}

interface HouseholdSearchOption {
    value: string; // memberId
    label: string;
    household_id: string;
    household_code: string | null;
    barangay: string | null;
    street: string | null;
    head_name: string | null;
}

export default function ReassignHouseholdDialog({ open, onClose, beneficiaryId, members, headState }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [operation, setOperation] = useState<Operation>('correction');
    const [destinationType, setDestinationType] = useState<DestinationType>('join');
    const [destinationMember, setDestinationMember] = useState<HouseholdSearchOption | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<HouseholdSearchOption[]>([]);
    const [searching, setSearching] = useState(false);
    const [newBarangay, setNewBarangay] = useState('');
    const [newStreet, setNewStreet] = useState('');
    const [verifyAtDestination, setVerifyAtDestination] = useState(false);
    const [reason, setReason] = useState('');
    const [successorId, setSuccessorId] = useState<string | null>(null);
    const [placeOnHold, setPlaceOnHold] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCurrentHead = useMemo(() => {
        return members.find(m => m.beneficiary_id === beneficiaryId && m.is_active)?.relationship === 'head';
    }, [members, beneficiaryId]);

    const currentHeadMemberId = headState.current_head_member_id;

    const eligibleSuccessors = useMemo(
        () => members.filter((m) => m.id !== currentHeadMemberId && headState.candidate_reasons[m.id] === null),
        [currentHeadMemberId, headState.candidate_reasons, members],
    );

    const ineligibleSuccessors = useMemo(
        () => members.filter((m) => m.id !== currentHeadMemberId && headState.candidate_reasons[m.id]),
        [currentHeadMemberId, headState.candidate_reasons, members],
    );

    const resetAndClose = () => {
        setOperation('correction');
        setDestinationType('join');
        setDestinationMember(null);
        setNewBarangay('');
        setNewStreet('');
        setVerifyAtDestination(false);
        setReason('');
        setSearchQuery('');
        setSearchResults([]);
        setSearching(false);
        setSuccessorId(null);
        setPlaceOnHold(false);
        onClose();
    };

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length < 3) return;
        setSearching(true);
        try {
            const res = await axios.get(`/api/action-center/beneficiary/${beneficiaryId}/household-members/search`, {
                params: { q: searchQuery.trim() },
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            });
            setSearchResults(
                res.data.data.map((m: HouseholdSearchOption & { member_name: string; member_id: string }) => ({
                    value: m.member_id,
                    label: m.member_name,
                    ...m,
                }))
            );
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const submit = () => {
        if (reason.trim().length < 5) {
            setError('Enter a short reason for this reassignment (at least 5 characters).');
            return;
        }

        if (operation !== 'move_out') {
            if (destinationType === 'join' && !destinationMember) {
                setError('Select an existing household to join.');
                return;
            }
            if (destinationType === 'create' && newBarangay.trim().length === 0) {
                setError('Barangay is required when creating a provisional household.');
                return;
            }
        }

        if (isCurrentHead) {
            if (!placeOnHold && !successorId) {
                setError('You must select a new head or place the household on hold.');
                return;
            }
            if (placeOnHold && successorId) {
                setError('Cannot select a successor when placing the household on hold.');
                return;
            }
        }

        setError(null);
        const data: Record<string, string | boolean | undefined> = {
            operation,
            reason: reason.trim(),
            verify_at_destination: verifyAtDestination,
        };

        if (isCurrentHead) {
            data.place_household_on_hold = placeOnHold;
            if (successorId) {
                data.successor_member_id = successorId;
            }
        }

        if (operation !== 'move_out') {
            if (destinationType === 'join') {
                data.destination_household_id = destinationMember?.household_id;
                data.destination_member_id = destinationMember?.value;
            } else {
                data.new_household_barangay = newBarangay.trim();
                data.new_household_street = newStreet.trim();
            }
        }

        router.post(
            `/api/action-center/beneficiary/${beneficiaryId}/reassign-household`,
            data,
            {
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onError: (errors) => setError(String(errors.beneficiary ?? 'Unable to process reassignment.')),
                onSuccess: resetAndClose,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && !processing && resetAndClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Reassign Household</DialogTitle>
                    <DialogDescription>
                        Correct a household assignment mistake, process a transfer, or mark a beneficiary as moved out.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Operation Type Selector */}
                    <div className="space-y-3">
                        <Label>Operation Type</Label>
                        <RadioGroup
                            value={operation}
                            onValueChange={(val) => {
                                setOperation(val as Operation);
                                setError(null);
                            }}
                            className="grid gap-3 sm:grid-cols-3"
                        >
                            <div>
                                <RadioGroupItem value="correction" id="op-correction" className="peer sr-only" />
                                <Label
                                    htmlFor="op-correction"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50 [&:has([data-state=checked])]:border-slate-900 cursor-pointer"
                                >
                                    <Wrench className="mb-3 h-6 w-6" />
                                    <span className="font-semibold text-center text-sm">Correction</span>
                                    <span className="text-xs text-slate-500 mt-1 text-center font-normal">Fixes an administrative mistake</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="transfer" id="op-transfer" className="peer sr-only" />
                                <Label
                                    htmlFor="op-transfer"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50 [&:has([data-state=checked])]:border-slate-900 cursor-pointer"
                                >
                                    <Home className="mb-3 h-6 w-6" />
                                    <span className="font-semibold text-center text-sm">Transfer</span>
                                    <span className="text-xs text-slate-500 mt-1 text-center font-normal">Legitimate residence change</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="move_out" id="op-moveout" className="peer sr-only" />
                                <Label
                                    htmlFor="op-moveout"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50 [&:has([data-state=checked])]:border-slate-900 cursor-pointer"
                                >
                                    <DoorOpen className="mb-3 h-6 w-6" />
                                    <span className="font-semibold text-center text-sm">Move Out</span>
                                    <span className="text-xs text-slate-500 mt-1 text-center font-normal">Left without new household</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {isCurrentHead && (
                        <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <h3 className="font-semibold text-amber-900 text-sm flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Source Household Head Successor
                            </h3>
                            <p className="text-xs text-amber-800">
                                This beneficiary is currently the head of household. You must appoint a successor or place the household on hold.
                            </p>
                            
                            <div className="space-y-3 mt-3">
                                {eligibleSuccessors.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-amber-900">Appoint new head:</Label>
                                        <RadioGroup
                                            value={successorId || ''}
                                            onValueChange={(val) => {
                                                setSuccessorId(val);
                                                setPlaceOnHold(false);
                                            }}
                                            className="grid gap-2"
                                        >
                                            {eligibleSuccessors.map((m) => (
                                                <Label
                                                    key={m.id}
                                                    className="flex cursor-pointer items-center justify-between rounded-md border border-amber-200 bg-white p-3 hover:bg-amber-100 [&:has([data-state=checked])]:border-amber-500 [&:has([data-state=checked])]:bg-amber-100/50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value={m.id} />
                                                        <span className="font-medium text-slate-800 capitalize">
                                                            {m.first_name} {m.last_name}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-500 capitalize">
                                                        {m.relationship}
                                                    </span>
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}
                                
                                {ineligibleSuccessors.length > 0 && (
                                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                                        <span className="font-medium">Ineligible members:</span>
                                        <ul className="list-inside list-disc">
                                            {ineligibleSuccessors.map((m) => (
                                                <li key={m.id} className="capitalize">
                                                    {m.first_name} {m.last_name} - <span className="lowercase">{headState.candidate_reasons[m.id]}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-amber-200/50">
                                    <Label className="flex items-center gap-2 cursor-pointer text-amber-900">
                                        <Checkbox 
                                            checked={placeOnHold} 
                                            onCheckedChange={(c) => {
                                                setPlaceOnHold(!!c);
                                                if (c) setSuccessorId(null);
                                            }} 
                                        />
                                        Place the source household on hold (no eligible successor available)
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Destination Section */}
                    {operation !== 'move_out' && (
                        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h3 className="font-semibold text-slate-900 text-sm">Destination Household</h3>
                            
                            <RadioGroup
                                value={destinationType}
                                onValueChange={(val) => setDestinationType(val as DestinationType)}
                                className="grid gap-3 sm:grid-cols-2"
                            >
                                <div>
                                    <RadioGroupItem value="join" id="dest-join" className="peer sr-only" />
                                    <Label 
                                        htmlFor="dest-join" 
                                        className="flex flex-col items-center justify-center rounded-md border-2 border-slate-200 bg-white p-3 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50 [&:has([data-state=checked])]:border-slate-900 cursor-pointer h-full text-center"
                                    >
                                        <span className="font-semibold text-sm">Join existing household</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="create" id="dest-create" className="peer sr-only" />
                                    <Label 
                                        htmlFor="dest-create" 
                                        className="flex flex-col items-center justify-center rounded-md border-2 border-slate-200 bg-white p-3 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-50 [&:has([data-state=checked])]:border-slate-900 cursor-pointer h-full text-center"
                                    >
                                        <span className="font-semibold text-sm">Create provisional household</span>
                                    </Label>
                                </div>
                            </RadioGroup>

                            {destinationType === 'join' && (
                                <div className="space-y-4 mt-4">
                                    <Label>Search for household member to join</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                            placeholder="Type Household Code or Beneficiary Number"
                                            className="text-sm flex-1"
                                        />
                                        <Button type="button" variant="secondary" onClick={handleSearch} disabled={searching || searchQuery.length < 3}>
                                            {searching ? 'Searching...' : 'Search'}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Type at least 3 characters. Matches active members in {currentMunicipality.name}.
                                    </p>

                                    {searchResults.length > 0 && (
                                        <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
                                            {searchResults.map((opt) => (
                                                <label
                                                    key={opt.value}
                                                    className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-slate-50"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="dest_member"
                                                        className="mt-1"
                                                        checked={destinationMember?.value === opt.value}
                                                        onChange={() => setDestinationMember(opt)}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">{opt.label}</div>
                                                        <div className="text-xs text-slate-500">
                                                            Head: {opt.head_name ?? 'None'} • {opt.barangay}
                                                            {opt.street ? `, ${opt.street}` : ''}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {destinationType === 'create' && (
                                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-barangay">Barangay <span className="text-red-500">*</span></Label>
                                        <BarangaySelect
                                            municipalityId={currentMunicipality.id}
                                            value={newBarangay}
                                            onChange={(selection) => setNewBarangay(selection.name)}
                                            useNameAsValue={true}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-street">Street / Sitio</Label>
                                        <Input
                                            id="new-street"
                                            value={newStreet}
                                            onChange={(e) => setNewStreet(e.target.value)}
                                            placeholder="Optional"
                                            className="uppercase"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                    id="verify-dest" 
                                    checked={verifyAtDestination}
                                    onCheckedChange={(c) => setVerifyAtDestination(c as boolean)}
                                />
                                <Label htmlFor="verify-dest" className="font-normal">
                                    Mark relationship as verified in destination household
                                </Label>
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reassign-reason">Reason <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="reassign-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Provide a written reason for this action."
                            maxLength={500}
                        />
                    </div>

                    {/* Confirmation Message */}
                    {operation && (
                        <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            {operation === 'correction' && "This will correct the household assignment. Historical assistance records will not be modified."}
                            {operation === 'transfer' && "This will transfer the beneficiary to the selected household. This counts as a residence event."}
                            {operation === 'move_out' && "This will deactivate the beneficiary's household membership without creating a new one."}
                        </div>
                    )}

                    {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetAndClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        onClick={submit} 
                        disabled={processing || (isCurrentHead && operation === 'move_out')}
                    >
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Action
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
