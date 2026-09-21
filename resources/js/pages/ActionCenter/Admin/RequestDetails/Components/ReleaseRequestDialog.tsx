import GetAssistanceCooldownContextController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/GetAssistanceCooldownContextController';
import ReleaseAssistanceRequestController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/ReleaseAssistanceRequestController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AssistanceDisbursement, CooldownAdvisory } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Props {
    requestId: string;
    claimantName: string;
    disbursement: AssistanceDisbursement | null;
    isOpen: boolean;
    onClose: () => void;
}

type ReleaseForm = {
    disbursement_id: string;
    release_reference_number: string;
    release_date: string;
    receiver_type: 'claimant' | 'representative';
    receiver_name: string;
    receiver_relationship: string;
    receiver_id_type: string;
    receiver_id_last_four: string;
    identity_confirmed: boolean;
    acknowledgement_signed: boolean;
    release_notes: string;
    confirm: boolean;
};

function todayDateInputValue(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function ReleaseRequestDialog({ requestId, claimantName, disbursement, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<ReleaseForm>({
        disbursement_id: disbursement?.id ?? '',
        release_reference_number: '',
        release_date: todayDateInputValue(),
        receiver_type: 'claimant',
        receiver_name: '',
        receiver_relationship: '',
        receiver_id_type: '',
        receiver_id_last_four: '',
        identity_confirmed: false,
        acknowledgement_signed: false,
        release_notes: '',
        confirm: false,
    });
    const [cooldownContext, setCooldownContext] = useState<CooldownAdvisory | null>(null);
    const [checkingCooldown, setCheckingCooldown] = useState(false);

    useEffect(() => {
        if (isOpen && disbursement) setData('disbursement_id', disbursement.id);
    }, [isOpen, disbursement, setData]);

    useEffect(() => {
        if (!isOpen || !data.release_date) return;
        let cancelled = false;
        setCheckingCooldown(true);
        axios
            .get(GetAssistanceCooldownContextController.url({ assistanceRequestId: requestId }), {
                params: { release_date: data.release_date },
                headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            })
            .then((response) => !cancelled && setCooldownContext(response.data as CooldownAdvisory))
            .catch(() => !cancelled && setCooldownContext(null))
            .finally(() => !cancelled && setCheckingCooldown(false));
        return () => {
            cancelled = true;
        };
    }, [currentMunicipality.slug, data.release_date, isOpen, requestId]);

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        post(ReleaseAssistanceRequestController.url({ assistanceRequestId: requestId }), {
            headers: { 'X-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        clearErrors();
        reset();
        setCooldownContext(null);
        onClose();
    };

    if (!disbursement) return null;

    const representative = data.receiver_type === 'representative';
    const blocked = cooldownContext?.permanent_block === true || (cooldownContext?.active === true && cooldownContext.authorization_current !== true);
    const releaseError = (errors as Record<string, string | undefined>).release;

    return (
        <Dialog open={isOpen} onOpenChange={(value) => !value && handleClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Record actual release</DialogTitle>
                    <DialogDescription>Confirm the physical handover. This terminal action starts the configured cooldown.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                        <Summary label="Payee" value={disbursement.payee_name} />
                        <Summary
                            label="Amount"
                            value={new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(disbursement.amount)}
                        />
                        <Summary label="Method" value={disbursement.method_label} />
                        <Summary
                            label={disbursement.method === 'check' ? 'Check number' : 'Cash voucher'}
                            value={disbursement.instrument_reference_number}
                        />
                    </div>

                    {(checkingCooldown || cooldownContext?.active || cooldownContext?.permanent_block) && (
                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                            {checkingCooldown ? (
                                <p className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Checking cooldowns...
                                </p>
                            ) : cooldownContext?.permanent_block ? (
                                <p className="flex items-center gap-2 font-semibold">
                                    <AlertTriangle className="h-4 w-4" /> A one-time limit blocks release.
                                </p>
                            ) : cooldownContext?.authorization_current ? (
                                <p className="flex items-center gap-2 font-semibold">
                                    <AlertTriangle className="h-4 w-4" /> The timed cooldown exception is authorized.
                                </p>
                            ) : (
                                <p className="flex items-start gap-2 font-semibold">
                                    <AlertTriangle className="mt-0.5 h-4 w-4" /> A decision maker must authorize the current cooldown before release.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="release_date">Actual release date</Label>
                            <Input
                                id="release_date"
                                type="date"
                                max={todayDateInputValue()}
                                value={data.release_date}
                                onChange={(event) => setData('release_date', event.target.value)}
                            />
                            {errors.release_date && <p className="text-xs text-red-600">{errors.release_date}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="release_reference_number">Receipt / acknowledgement reference</Label>
                            <Input
                                id="release_reference_number"
                                value={data.release_reference_number}
                                onChange={(event) => setData('release_reference_number', event.target.value)}
                                maxLength={60}
                            />
                            {errors.release_reference_number && <p className="text-xs text-red-600">{errors.release_reference_number}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Received by</Label>
                        <Select value={data.receiver_type} onValueChange={(value: 'claimant' | 'representative') => setData('receiver_type', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="claimant">Claimant: {claimantName}</SelectItem>
                                <SelectItem value="representative">Authorized representative</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {representative && (
                        <div className="grid grid-cols-1 gap-4 rounded-md border border-slate-200 p-3 sm:grid-cols-2">
                            <ReleaseField
                                label="Representative full name"
                                value={data.receiver_name}
                                error={errors.receiver_name}
                                onChange={(value) => setData('receiver_name', value)}
                            />
                            <ReleaseField
                                label="Relationship to claimant"
                                value={data.receiver_relationship}
                                error={errors.receiver_relationship}
                                onChange={(value) => setData('receiver_relationship', value)}
                            />
                            <ReleaseField
                                label="Inspected ID type"
                                value={data.receiver_id_type}
                                error={errors.receiver_id_type}
                                onChange={(value) => setData('receiver_id_type', value)}
                            />
                            <ReleaseField
                                label="Last four ID characters"
                                value={data.receiver_id_last_four}
                                error={errors.receiver_id_last_four}
                                maxLength={4}
                                onChange={(value) => setData('receiver_id_last_four', value.toUpperCase())}
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="release_notes">Release notes</Label>
                        <Textarea
                            id="release_notes"
                            value={data.release_notes}
                            onChange={(event) => setData('release_notes', event.target.value)}
                            rows={3}
                            maxLength={1000}
                        />
                        {errors.release_notes && <p className="text-xs text-red-600">{errors.release_notes}</p>}
                    </div>

                    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                        <Confirmation
                            id="identity_confirmed"
                            checked={data.identity_confirmed}
                            onChange={(value) => setData('identity_confirmed', value)}
                            label="I inspected the receiver's identity."
                            error={errors.identity_confirmed}
                        />
                        <Confirmation
                            id="acknowledgement_signed"
                            checked={data.acknowledgement_signed}
                            onChange={(value) => setData('acknowledgement_signed', value)}
                            label="The receiver signed the acknowledgement receipt."
                            error={errors.acknowledgement_signed}
                        />
                        <Confirmation
                            id="release_confirm"
                            checked={data.confirm}
                            onChange={(value) => setData('confirm', value)}
                            label="I confirm the assistance was physically handed over and this record becomes immutable."
                            error={errors.confirm}
                        />
                    </div>

                    {releaseError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{releaseError}</p>}

                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || checkingCooldown || blocked}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Confirm physical release
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

function ReleaseField({
    label,
    value,
    error,
    maxLength,
    onChange,
}: {
    label: string;
    value: string;
    error?: string;
    maxLength?: number;
    onChange: (value: string) => void;
}) {
    const id = label.toLowerCase().replace(/\s+/g, '_');
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

function Confirmation({
    id,
    checked,
    label,
    error,
    onChange,
}: {
    id: string;
    checked: boolean;
    label: string;
    error?: string;
    onChange: (value: boolean) => void;
}) {
    return (
        <div>
            <div className="flex items-start gap-2">
                <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} className="mt-0.5" />
                <Label htmlFor={id} className="text-sm leading-5">
                    {label}
                </Label>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
