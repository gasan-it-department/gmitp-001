import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CloseIntermentForm, PlotLeaseSummary } from '@/Core/Types/Cemetery/cemetery';
import { useForm } from '@inertiajs/react';
import { Archive, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    closeUrl: string;
    municipalitySlug: string;
    label?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    asDropdownItem?: boolean;
    activeLease?: PlotLeaseSummary | null;
}

const today = () => new Date().toISOString().slice(0, 10);

export function CloseIntermentDialog({
    closeUrl,
    municipalitySlug,
    label = 'Close Interment',
    size = 'default',
    className,
    asDropdownItem,
    activeLease = null,
    open: externalOpen,
    onOpenChange: setExternalOpen,
}: Props & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen ?? setInternalOpen;
    const form = useForm<CloseIntermentForm>({
        _method: 'patch',
        end_type: 'exhumed',
        ended_date: today(),
        reason: '',
        notes: '',
        permit_reference: '',
        transfer_destination: '',
        requesting_party_name: '',
        requesting_party_contact: '',
        requesting_party_address: '',
        requesting_party_relationship: '',
        requester_is_leaseholder: false,
        leaseholder_consent_confirmed: false,
        leaseholder_consent_method: activeLease ? '' : 'not_applicable',
        leaseholder_consent_reference: '',
        service_request_notes: '',
        authorization_evidence: null,
    });
    const needsLeaseholderConsent = Boolean(activeLease && !form.data.requester_is_leaseholder);
    const requesterComplete = form.data.requesting_party_name.trim() !== '' && form.data.requesting_party_relationship.trim() !== '';
    const leaseholderConsentComplete =
        !needsLeaseholderConsent ||
        (form.data.leaseholder_consent_confirmed &&
            form.data.leaseholder_consent_method !== '' &&
            form.data.leaseholder_consent_method !== 'not_applicable' &&
            form.data.leaseholder_consent_reference.trim() !== '');

    const close = () => {
        if (form.processing) return;
        setOpen(false);
        form.clearErrors();
        form.setData({
            _method: 'patch',
            end_type: 'exhumed',
            ended_date: today(),
            reason: '',
            notes: '',
            permit_reference: '',
            transfer_destination: '',
            requesting_party_name: '',
            requesting_party_contact: '',
            requesting_party_address: '',
            requesting_party_relationship: '',
            requester_is_leaseholder: false,
            leaseholder_consent_confirmed: false,
            leaseholder_consent_method: activeLease ? '' : 'not_applicable',
            leaseholder_consent_reference: '',
            service_request_notes: '',
            authorization_evidence: null,
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(closeUrl, {
            headers: { 'X-Municipality-Slug': municipalitySlug },
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
            {externalOpen === undefined &&
                (asDropdownItem ? (
                    <DropdownMenuItem
                        onSelect={(event) => {
                            event.preventDefault();
                            setOpen(true);
                        }}
                        className={className}
                    >
                        <Archive size={14} className="mr-2" />
                        {label}
                    </DropdownMenuItem>
                ) : (
                    <Button type="button" variant="outline" size={size} className={className} onClick={() => setOpen(true)}>
                        <Archive size={16} className="mr-2" />
                        {label}
                    </Button>
                ))}

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Exhume or Transfer Out?</DialogTitle>
                        <DialogDescription>
                            This ends the active interment without assigning a new plot. The Decedent history and Plot history will keep the record.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-5 grid gap-4">
                        <div className="space-y-2">
                            <Label>Outcome</Label>
                            <Select
                                value={form.data.end_type}
                                onValueChange={(value) => form.setData('end_type', value as CloseIntermentForm['end_type'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="exhumed">Exhumed</SelectItem>
                                    <SelectItem value="transferred_out">Transferred Out</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.end_type && <p className="text-sm text-red-600">{form.errors.end_type}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ended-date">Date</Label>
                            <Input
                                id="ended-date"
                                type="date"
                                value={form.data.ended_date}
                                onChange={(event) => form.setData('ended_date', event.target.value)}
                            />
                            {form.errors.ended_date && <p className="text-sm text-red-600">{form.errors.ended_date}</p>}
                        </div>

                        {form.data.end_type === 'transferred_out' && (
                            <div className="space-y-2">
                                <Label htmlFor="transfer-destination">Transfer destination</Label>
                                <Input
                                    id="transfer-destination"
                                    value={form.data.transfer_destination}
                                    onChange={(event) => form.setData('transfer_destination', event.target.value)}
                                    placeholder="e.g. BOAC MUNICIPAL CEMETERY or MANILA NORTH CEMETERY"
                                />
                                {form.errors.transfer_destination && <p className="text-sm text-red-600">{form.errors.transfer_destination}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="permit-reference">Permit / reference number</Label>
                            <Input
                                id="permit-reference"
                                value={form.data.permit_reference}
                                onChange={(event) => form.setData('permit_reference', event.target.value)}
                                placeholder="Optional permit or document reference"
                            />
                            {form.errors.permit_reference && <p className="text-sm text-red-600">{form.errors.permit_reference}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="close-reason">Reason</Label>
                            <Textarea
                                id="close-reason"
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                                placeholder="Explain why this interment is being closed."
                                className="min-h-24"
                            />
                            {form.errors.reason && <p className="text-sm text-red-600">{form.errors.reason}</p>}
                            {form.errors.interment && <p className="text-sm text-red-600">{form.errors.interment}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="close-notes">Notes</Label>
                            <Textarea
                                id="close-notes"
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                                placeholder="Optional operational notes."
                                className="min-h-20"
                            />
                            {form.errors.notes && <p className="text-sm text-red-600">{form.errors.notes}</p>}
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h3 className="text-sm font-semibold text-slate-900">Requesting Party / Authorization</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Record who requested this action and how the active leaseholder authorized it, when a leaseholder exists.
                            </p>

                            {activeLease ? (
                                <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950">
                                    <p className="text-xs font-semibold tracking-wide uppercase">Consent Target: Current Plot Leaseholder</p>
                                    <p className="mt-1 font-medium">{activeLease.leaseholder_name}</p>
                                    <p className="mt-1 text-xs text-indigo-700">
                                        {activeLease.leaseholder_contact ?? 'No contact recorded'}
                                        {activeLease.leaseholder_relationship ? ` / ${activeLease.leaseholder_relationship}` : ''}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">
                                    No active leaseholder is recorded for this plot. Requester details are still saved for the cemetery trail.
                                </div>
                            )}

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="close-requester-name">Requesting Party Name *</Label>
                                    <Input
                                        id="close-requester-name"
                                        value={form.data.requesting_party_name}
                                        onChange={(event) => form.setData('requesting_party_name', event.target.value)}
                                        placeholder="e.g. JUAN DELA CRUZ"
                                    />
                                    {form.errors.requesting_party_name && (
                                        <p className="mt-1 text-sm text-red-600">{form.errors.requesting_party_name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="close-requester-relationship">Relationship / Role *</Label>
                                    <Input
                                        id="close-requester-relationship"
                                        value={form.data.requesting_party_relationship}
                                        onChange={(event) => form.setData('requesting_party_relationship', event.target.value)}
                                        placeholder="e.g. SPOUSE, CHILD, REPRESENTATIVE"
                                    />
                                    {form.errors.requesting_party_relationship && (
                                        <p className="mt-1 text-sm text-red-600">{form.errors.requesting_party_relationship}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="close-requester-contact">Contact Number</Label>
                                    <Input
                                        id="close-requester-contact"
                                        value={form.data.requesting_party_contact}
                                        onChange={(event) => form.setData('requesting_party_contact', event.target.value)}
                                        placeholder="Optional"
                                    />
                                    {form.errors.requesting_party_contact && (
                                        <p className="mt-1 text-sm text-red-600">{form.errors.requesting_party_contact}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="close-requester-address">Address</Label>
                                    <Input
                                        id="close-requester-address"
                                        value={form.data.requesting_party_address}
                                        onChange={(event) => form.setData('requesting_party_address', event.target.value)}
                                        placeholder="Optional"
                                    />
                                    {form.errors.requesting_party_address && (
                                        <p className="mt-1 text-sm text-red-600">{form.errors.requesting_party_address}</p>
                                    )}
                                </div>
                            </div>

                            {activeLease && (
                                <div className="mt-4 space-y-4">
                                    <label className="flex items-start gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={form.data.requester_is_leaseholder}
                                            onChange={(event) =>
                                                form.setData({
                                                    ...form.data,
                                                    requester_is_leaseholder: event.target.checked,
                                                    leaseholder_consent_confirmed: event.target.checked,
                                                    leaseholder_consent_method: event.target.checked ? 'leaseholder_present' : '',
                                                    leaseholder_consent_reference: '',
                                                })
                                            }
                                            className="mt-1"
                                        />
                                        <span>The requesting party is the current plot leaseholder shown above.</span>
                                    </label>

                                    {needsLeaseholderConsent && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                            <h4 className="text-sm font-semibold text-amber-950">Leaseholder Authorization Required</h4>
                                            <p className="mt-1 text-sm text-amber-800">
                                                The requester is different from the active leaseholder, so record how authorization was confirmed.
                                            </p>
                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label>Consent Method *</Label>
                                                    <Select
                                                        value={form.data.leaseholder_consent_method}
                                                        onValueChange={(value) =>
                                                            form.setData(
                                                                'leaseholder_consent_method',
                                                                value as CloseIntermentForm['leaseholder_consent_method'],
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select consent method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="leaseholder_present">Leaseholder Present</SelectItem>
                                                            <SelectItem value="verbal_authorization">Verbal Authorization</SelectItem>
                                                            <SelectItem value="written_authorization">Written Authorization</SelectItem>
                                                            <SelectItem value="family_attestation">Family Attestation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {form.errors.leaseholder_consent_method && (
                                                        <p className="mt-1 text-sm text-red-600">{form.errors.leaseholder_consent_method}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label htmlFor="close-consent-reference">Consent Reference *</Label>
                                                    <Input
                                                        id="close-consent-reference"
                                                        value={form.data.leaseholder_consent_reference}
                                                        onChange={(event) => form.setData('leaseholder_consent_reference', event.target.value)}
                                                        placeholder="e.g. SIGNED LETTER, CALL WITH ADMIN HEAD"
                                                    />
                                                    {form.errors.leaseholder_consent_reference && (
                                                        <p className="mt-1 text-sm text-red-600">{form.errors.leaseholder_consent_reference}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <label className="mt-4 flex items-start gap-2 rounded border border-amber-200 bg-white px-3 py-2 text-xs text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.leaseholder_consent_confirmed}
                                                    onChange={(event) => form.setData('leaseholder_consent_confirmed', event.target.checked)}
                                                    className="mt-0.5"
                                                />
                                                <span>I confirm that the active leaseholder authorized this request.</span>
                                            </label>
                                            {form.errors.leaseholder_consent_confirmed && (
                                                <p className="mt-1 text-sm text-red-600">{form.errors.leaseholder_consent_confirmed}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="close-authorization-evidence">Authorization Evidence</Label>
                                    <Input
                                        id="close-authorization-evidence"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(event) => form.setData('authorization_evidence', event.target.files?.[0] ?? null)}
                                    />
                                    <p className="mt-1 text-xs text-slate-500">Optional JPG, PNG, WEBP, or PDF. Max 5 MB.</p>
                                    {form.errors.authorization_evidence && (
                                        <p className="mt-1 text-sm text-red-600">{form.errors.authorization_evidence}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="close-service-notes">Request Notes</Label>
                                    <Input
                                        id="close-service-notes"
                                        value={form.data.service_request_notes}
                                        onChange={(event) => form.setData('service_request_notes', event.target.value)}
                                        placeholder="Optional requester/authorization notes"
                                    />
                                    {form.errors.service_request_notes && (
                                        <p className="mt-1 text-sm text-red-600">{form.errors.service_request_notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={close} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={form.processing || form.data.reason.trim().length === 0 || !requesterComplete || !leaseholderConsentComplete}
                        >
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Close Interment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
