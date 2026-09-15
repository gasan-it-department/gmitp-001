import AuthorizeCooldownExceptionController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/AuthorizeCooldownExceptionController';
import GetAssistanceCooldownContextController from '@/actions/App/External/Api/Controllers/ActionCenter/Assistance/GetAssistanceCooldownContextController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CooldownAdvisory } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Props {
    requestId: string;
    transactionNumber: string;
    isOpen: boolean;
    onClose: () => void;
}

function today(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function AuthorizeCooldownExceptionDialog({ requestId, transactionNumber, isOpen, onClose }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [context, setContext] = useState<CooldownAdvisory | null>(null);
    const [loadingContext, setLoadingContext] = useState(false);
    const [contextError, setContextError] = useState<string | null>(null);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        release_date: today(),
        cooldown_context_fingerprint: '',
        reason: '',
        confirm: false as boolean,
    });

    useEffect(() => {
        if (!isOpen || !data.release_date) return;

        let cancelled = false;
        setLoadingContext(true);
        setContextError(null);
        axios
            .get(GetAssistanceCooldownContextController.url({ assistanceRequestId: requestId }), {
                params: { release_date: data.release_date },
                headers: { 'x-Municipality-Slug': currentMunicipality.slug },
            })
            .then((response) => {
                if (cancelled) return;
                const next = response.data as CooldownAdvisory;
                setContext(next);
                setData('cooldown_context_fingerprint', next.context_fingerprint);
            })
            .catch(() => {
                if (!cancelled) setContextError('Unable to load the cooldown context for this date.');
            })
            .finally(() => {
                if (!cancelled) setLoadingContext(false);
            });

        return () => {
            cancelled = true;
        };
    }, [currentMunicipality.slug, data.release_date, isOpen, requestId, setData]);

    const close = () => {
        clearErrors();
        reset();
        setContext(null);
        setContextError(null);
        onClose();
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(AuthorizeCooldownExceptionController.url({ assistanceRequestId: requestId }), {
            headers: { 'x-Municipality-Slug': currentMunicipality.slug },
            preserveScroll: true,
            onSuccess: close,
        });
    };

    const cannotAuthorize = loadingContext || !context?.active || context.permanent_block === true;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Authorize Cooldown Exception</DialogTitle>
                    <DialogDescription>
                        Review the releases that apply to {transactionNumber}. This authorization does not change the approved amount.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="exception_release_date">Expected actual release date</Label>
                        <Input
                            id="exception_release_date"
                            type="date"
                            max={today()}
                            value={data.release_date}
                            onChange={(event) => setData('release_date', event.target.value)}
                        />
                        {errors.release_date && <p className="text-xs text-red-600">{errors.release_date}</p>}
                    </div>

                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                        {loadingContext ? (
                            <p className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Checking prior releases...
                            </p>
                        ) : contextError ? (
                            <p className="text-red-700">{contextError}</p>
                        ) : context?.permanent_block ? (
                            <p className="font-semibold">A one-time limit applies and cannot be overridden.</p>
                        ) : context?.active ? (
                            <>
                                <p className="flex items-center gap-2 font-semibold">
                                    <AlertTriangle className="h-4 w-4" /> {context.sources.length} active cooldown source
                                    {context.sources.length === 1 ? '' : 's'}
                                </p>
                                <ul className="mt-2 space-y-1 text-xs">
                                    {context.sources.map((source) => (
                                        <li key={source.source_fingerprint}>
                                            {source.transaction_number ?? source.request_id} - {source.program ?? 'Assistance'} released{' '}
                                            {source.release_date ?? 'unknown date'}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p>No timed cooldown applies on this release date.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="exception_reason">Administrative reason</Label>
                        <Textarea
                            id="exception_reason"
                            rows={4}
                            maxLength={1000}
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            placeholder="Explain why assistance is authorized during the active cooldown..."
                        />
                        {errors.reason && <p className="text-xs text-red-600">{errors.reason}</p>}
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <Checkbox id="exception_confirm" checked={data.confirm} onCheckedChange={(value) => setData('confirm', value === true)} />
                        <Label htmlFor="exception_confirm" className="text-sm leading-relaxed">
                            I reviewed the listed prior releases and explicitly authorize this timed cooldown exception.
                        </Label>
                    </div>
                    {errors.confirm && <p className="text-xs text-red-600">{errors.confirm}</p>}
                    {errors.cooldown_context_fingerprint && <p className="text-xs text-red-600">{errors.cooldown_context_fingerprint}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || cannotAuthorize}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                            Authorize exception
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
