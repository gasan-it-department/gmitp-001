import MarkAssistanceDisbursementReadyController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/MarkAssistanceDisbursementReadyController';
import RecordAssistanceDisbursementManualContactController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/RecordAssistanceDisbursementManualContactController';
import RetryAssistanceDisbursementNotificationController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/RetryAssistanceDisbursementNotificationController';
import VoidAssistanceDisbursementController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/VoidAssistanceDisbursementController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AssistanceDisbursement } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Banknote, BellRing, CheckCircle2, Loader2, MessageSquare, Pencil, RefreshCw, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    requestId: string;
    requestStatus: string;
    disbursements: AssistanceDisbursement[];
    canDisburse: boolean;
    canRelease: boolean;
    canPrepare: boolean;
    onPrepare: () => void;
    onRelease: (disbursement: AssistanceDisbursement) => void;
}

const statusClasses: Record<string, string> = {
    preparing: 'border-amber-200 bg-amber-50 text-amber-800',
    ready: 'border-sky-200 bg-sky-50 text-sky-800',
    released: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    voided: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function DisbursementPanel({
    requestId,
    requestStatus,
    disbursements,
    canDisburse,
    canRelease,
    canPrepare,
    onPrepare,
    onRelease,
}: Props) {
    const { errors: pageErrors, currentMunicipality } = usePage<{
        errors: Record<string, string | undefined>;
        currentMunicipality: Municipality;
    }>().props;
    const municipalityHeaders = { 'X-Municipality-Slug': currentMunicipality.slug };
    const current =
        disbursements.find((item) => item.status === 'preparing' || item.status === 'ready') ??
        disbursements.find((item) => item.status === 'released') ??
        null;
    const previous = current ? disbursements.filter((item) => item.id !== current.id) : disbursements;
    const [readyOpen, setReadyOpen] = useState(false);
    const [voidOpen, setVoidOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const voidForm = useForm({ reason: '', confirm: true });
    const contactForm = useForm({ channel: 'phone_call', note: '' });
    const retryableNotification = current?.notification_status === 'failed' || current?.notification_status === 'unavailable';
    const recentSubmission =
        current?.notification_status === 'sending' &&
        current.notification_attempted_at !== null &&
        new Date(current.notification_attempted_at).getTime() > Date.now() - 5 * 60 * 1000;

    const markReady = () => {
        if (!current) return;
        setBusy(true);
        router.post(
            MarkAssistanceDisbursementReadyController.url({ assistanceRequestId: requestId, disbursementId: current.id }),
            { confirm: true },
            { headers: municipalityHeaders, preserveScroll: true, onFinish: () => setBusy(false), onSuccess: () => setReadyOpen(false) },
        );
    };

    const retry = () => {
        if (!current) return;
        setBusy(true);
        router.post(
            RetryAssistanceDisbursementNotificationController.url({ assistanceRequestId: requestId, disbursementId: current.id }),
            { confirm: true },
            { headers: municipalityHeaders, preserveScroll: true, onFinish: () => setBusy(false) },
        );
    };

    const submitVoid = () => {
        if (!current) return;
        voidForm.post(VoidAssistanceDisbursementController.url({ assistanceRequestId: requestId, disbursementId: current.id }), {
            headers: municipalityHeaders,
            preserveScroll: true,
            onSuccess: () => {
                voidForm.reset();
                setVoidOpen(false);
            },
        });
    };

    const submitContact = () => {
        if (!current) return;
        contactForm.post(RecordAssistanceDisbursementManualContactController.url({ assistanceRequestId: requestId, disbursementId: current.id }), {
            headers: municipalityHeaders,
            preserveScroll: true,
            onSuccess: () => {
                contactForm.reset();
                setContactOpen(false);
            },
        });
    };

    return (
        <>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div>
                        <CardTitle className="text-base">Disbursement and Claim</CardTitle>
                        <p className="mt-1 text-xs text-slate-500">Financial preparation is separate from physical release.</p>
                    </div>
                    {current && (
                        <Badge variant="outline" className={statusClasses[current.status]}>
                            Attempt #{current.attempt_number} · {current.status_label}
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-5 sm:px-6">
                    {(pageErrors?.disbursement || pageErrors?.disbursement_contact || pageErrors?.disbursement_notification) && (
                        <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{pageErrors.disbursement ?? pageErrors.disbursement_contact ?? pageErrors.disbursement_notification}</p>
                        </div>
                    )}
                    {!current ? (
                        <div className="flex flex-col gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    {requestStatus === 'released' ? 'Legacy release' : 'No active disbursement'}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {requestStatus === 'released'
                                        ? 'This request was released before the disbursement workflow was introduced. Its existing release record remains authoritative.'
                                        : 'An approved and MSWD-verified request can enter financial preparation.'}
                                </p>
                            </div>
                            {requestStatus !== 'released' && canDisburse && canPrepare && (
                                <Button onClick={onPrepare} className="w-full sm:w-auto">
                                    <Banknote className="mr-2 h-4 w-4" /> Prepare disbursement
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm lg:grid-cols-4">
                                <Field label="Method" value={current.method_label} />
                                <Field
                                    label={current.method === 'check' ? 'Check number' : 'Cash voucher reference'}
                                    value={current.instrument_reference_number}
                                />
                                <Field
                                    label={current.method === 'check' ? 'Check date' : 'Voucher date'}
                                    value={formatDate(current.instrument_date)}
                                />
                                <Field label="Claim location" value={current.claim_location_label} />
                                <Field label="Payee" value={current.payee_name} />
                                <Field label="Amount" value={formatCurrency(current.amount)} />
                                <Field label="Prepared by" value={current.prepared_by?.name ?? 'Unknown user'} />
                                <Field label="Prepared at" value={formatDateTime(current.prepared_at)} />
                                {current.ready_at && <Field label="Ready by" value={current.ready_by?.name ?? 'Unknown user'} />}
                                {current.ready_at && <Field label="Ready at" value={formatDateTime(current.ready_at)} />}
                                {current.released_at && <Field label="Released by" value={current.released_by?.name ?? 'Unknown user'} />}
                                {current.released_at && <Field label="Released at" value={formatDateTime(current.released_at)} />}
                                {current.release_reference_number && (
                                    <Field label="Receipt / acknowledgement reference" value={current.release_reference_number} />
                                )}
                                {current.receiver_name && (
                                    <Field
                                        label={current.receiver_type === 'representative' ? 'Authorized representative' : 'Received by'}
                                        value={current.receiver_name}
                                    />
                                )}
                            </div>

                            {(current.claim_instructions || current.preparation_notes) && (
                                <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
                                    {current.claim_instructions && <Field label="Public claim instructions" value={current.claim_instructions} />}
                                    {current.preparation_notes && <Field label="Preparation notes" value={current.preparation_notes} />}
                                </div>
                            )}

                            {current.status === 'ready' && current.notification_attempted_at && (
                                <p className="text-xs text-slate-500">
                                    Notification attempt #{current.notification_attempts} on {formatDateTime(current.notification_attempted_at)}.
                                    {current.manual_contacts.length > 0 && ` ${current.manual_contacts.length} manual contact record(s) saved.`}
                                </p>
                            )}

                            {current.status === 'ready' &&
                                (current.notification_status === 'failed' || current.notification_status === 'unavailable') && (
                                    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <p className="font-semibold">Claimant notification needs attention</p>
                                            <p className="mt-0.5 text-xs">
                                                {current.notification_failure ?? 'The SMS has not been confirmed as sent.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {current.status === 'ready' && current.notification_status === 'sending' && (
                                <div className="flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting SMS to Semaphore.
                                </div>
                            )}

                            {current.status === 'ready' && current.notification_status === 'submitted' && (
                                <div className="flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
                                    <CheckCircle2 className="h-4 w-4" /> SMS accepted by Semaphore for {current.notification_phone}.
                                </div>
                            )}

                            {current.status === 'ready' && current.notification_status === 'sent' && (
                                <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                    <CheckCircle2 className="h-4 w-4" /> Claim notice sent to the mobile network for {current.notification_phone}.
                                </div>
                            )}

                            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap">
                                {canDisburse && current.status === 'preparing' && (
                                    <>
                                        <Button variant="outline" onClick={onPrepare}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit draft
                                        </Button>
                                        <Button onClick={() => setReadyOpen(true)}>
                                            <BellRing className="mr-2 h-4 w-4" /> Mark ready and notify
                                        </Button>
                                    </>
                                )}
                                {canDisburse && current.status === 'ready' && retryableNotification && (
                                    <>
                                        <Button variant="outline" onClick={retry} disabled={busy}>
                                            <RefreshCw className="mr-2 h-4 w-4" /> Retry SMS
                                        </Button>
                                        <Button variant="outline" onClick={() => setContactOpen(true)}>
                                            <MessageSquare className="mr-2 h-4 w-4" /> Record manual contact
                                        </Button>
                                    </>
                                )}
                                {canRelease && current.status === 'ready' && (
                                    <Button onClick={() => onRelease(current)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Record actual release
                                    </Button>
                                )}
                                {canDisburse && (current.status === 'preparing' || current.status === 'ready') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setVoidOpen(true)}
                                        disabled={recentSubmission}
                                        title={
                                            recentSubmission ? 'Wait for the active SMS submission to finish, then refresh this request.' : undefined
                                        }
                                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" /> Void disbursement
                                    </Button>
                                )}
                            </div>
                        </>
                    )}

                    {previous.length > 0 && (
                        <div className="border-t border-slate-200 pt-4">
                            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Previous attempts</p>
                            <div className="space-y-2">
                                {previous.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <span className="font-medium text-slate-800">
                                            Attempt #{item.attempt_number} · {item.method_label} · {item.instrument_reference_number}
                                        </span>
                                        <span className="text-slate-500">
                                            {item.status_label}
                                            {item.voided_at ? ` on ${formatDateTime(item.voided_at)}` : ''}
                                            {item.voided_by?.name ? ` by ${item.voided_by.name}` : ''}
                                            {item.void_reason ? `: ${item.void_reason}` : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={readyOpen} onOpenChange={setReadyOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark ready and notify?</DialogTitle>
                        <DialogDescription>
                            The financial details will lock and the claimant will be told where to claim the assistance.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <Button variant="outline" onClick={() => setReadyOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={markReady} disabled={busy}>
                            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Mark ready and notify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Void disbursement</DialogTitle>
                        <DialogDescription>
                            The attempt remains in history. A claimant whose SMS was accepted will receive a cancellation notice.
                            {current?.manual_contacts.length
                                ? ' Because manual contact was recorded, staff must also communicate the cancellation manually.'
                                : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="void_reason">Reason</Label>
                        <Textarea
                            id="void_reason"
                            value={voidForm.data.reason}
                            onChange={(event) => voidForm.setData('reason', event.target.value)}
                            rows={4}
                        />
                        {voidForm.errors.reason && <p className="text-xs text-red-600">{voidForm.errors.reason}</p>}
                    </div>
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <Button variant="outline" onClick={() => setVoidOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitVoid} disabled={voidForm.processing}>
                            Void attempt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record manual contact</DialogTitle>
                        <DialogDescription>Use this when SMS is unavailable or delivery could not be confirmed.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Channel</Label>
                            <Select value={contactForm.data.channel} onValueChange={(value) => contactForm.setData('channel', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="phone_call">Phone call</SelectItem>
                                    <SelectItem value="in_person">In person</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="contact_note">Contact note</Label>
                            <Textarea
                                id="contact_note"
                                value={contactForm.data.note}
                                onChange={(event) => contactForm.setData('note', event.target.value)}
                                rows={3}
                            />
                            {contactForm.errors.note && <p className="text-xs text-red-600">{contactForm.errors.note}</p>}
                        </div>
                    </div>
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <Button variant="outline" onClick={() => setContactOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={submitContact} disabled={contactForm.processing}>
                            Record contact
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
            <p className="mt-0.5 break-words text-slate-900">{value}</p>
        </div>
    );
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
const formatDateTime = (value: string | null) =>
    value
        ? new Date(value).toLocaleString('en-PH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          })
        : 'Not recorded';
