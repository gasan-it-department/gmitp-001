import GenerateObligationRequestController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/GenerateObligationRequestController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, ArrowLeft, FileDown, FilePenLine, Info, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ObligationRequestContext {
    assistance_request_id: string;
    transaction_number: string;
    payee: string;
    address: string;
    assistance_type: string;
    approved_amount: number;
    suggested_particulars: string;
}

interface Props {
    obligationRequest: ObligationRequestContext;
}

interface FormData {
    obligation_request_number: string;
    responsibility_center: string;
    account_code: string;
    particulars: string;
    office: string;
    fpp: string;
    mswdo_printed_name: string;
    mswdo_position: string;
    budget_officer_printed_name: string;
    budget_officer_position: string;
}

type FieldErrors = Partial<Record<keyof FormData | 'request', string>>;

interface ErrorPayload {
    message?: string;
    errors?: Record<string, string[] | string>;
}

const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
});

export default function ObligationRequestGenerator({ obligationRequest }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [data, setData] = useState<FormData>({
        obligation_request_number: '',
        responsibility_center: '',
        account_code: '',
        particulars: obligationRequest.suggested_particulars,
        office: '',
        fpp: '',
        mswdo_printed_name: '',
        mswdo_position: 'Municipal Social Welfare and Development Officer',
        budget_officer_printed_name: '',
        budget_officer_position: 'Municipal Budget Officer',
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const detailUrl = ShowAssistanceRequestProfileController.url({
        municipality: currentMunicipality.slug,
        assistanceRequest: obligationRequest.assistance_request_id,
    });

    const update = (field: keyof FormData, value: string) => {
        setData((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const readErrorPayload = async (error: unknown): Promise<ErrorPayload | null> => {
        if (!axios.isAxiosError(error)) return null;

        const axiosError = error as AxiosError<Blob | ErrorPayload>;
        const responseData = axiosError.response?.data;

        if (responseData instanceof Blob) {
            try {
                return JSON.parse(await responseData.text()) as ErrorPayload;
            } catch {
                return null;
            }
        }

        return responseData ?? null;
    };

    const downloadPdf = (blob: Blob, contentDisposition?: string) => {
        const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
        const filename = match?.[1] ?? `obligation-request_${obligationRequest.transaction_number}.pdf`;
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        setGeneralError(null);

        try {
            const response = await axios.post(
                GenerateObligationRequestController.url({
                    municipality: currentMunicipality.slug,
                    assistanceRequestId: obligationRequest.assistance_request_id,
                }),
                data,
                {
                    responseType: 'blob',
                    headers: {
                        Accept: 'application/json, application/pdf',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-Municipality-Slug': currentMunicipality.slug,
                    },
                },
            );

            downloadPdf(response.data, response.headers['content-disposition']);
        } catch (error) {
            const payload = await readErrorPayload(error);
            const nextErrors: FieldErrors = {};

            Object.entries(payload?.errors ?? {}).forEach(([field, messages]) => {
                nextErrors[field as keyof FieldErrors] = Array.isArray(messages) ? messages[0] : messages;
            });

            setErrors(nextErrors);
            setGeneralError(payload?.message ?? 'The Obligation Request could not be generated. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const FieldError = ({ field }: { field: keyof FieldErrors }) =>
        errors[field] ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p> : null;

    return (
        <AdminLayout>
            <Head title={`Obligation Request - ${obligationRequest.transaction_number}`} />

            <div className="min-h-screen bg-slate-50 pb-20">
                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
                        <Link href={detailUrl} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="h-4 w-4" />
                            Back to request
                        </Link>
                    </div>
                </div>

                <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
                    <div className="mb-6 flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                            <FilePenLine className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Generate Obligation Request</h1>
                            <p className="mt-1 text-sm break-words text-slate-500">Transaction {obligationRequest.transaction_number}</p>
                        </div>
                    </div>

                    <div className="mb-6 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <Info className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            The accounting values and generated PDF are not saved. Confirm them against the paper record before printing. Reprinting
                            requires entering these fields again.
                        </p>
                    </div>

                    <section className="mb-6 rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold text-slate-900">Request details</h2>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Payee</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{obligationRequest.payee}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Assistance type</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{obligationRequest.assistance_type}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Address</dt>
                                <dd className="mt-1 text-sm text-slate-800">{obligationRequest.address}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Approved amount</dt>
                                <dd className="mt-1 text-base font-bold text-slate-950">{currency.format(obligationRequest.approved_amount)}</dd>
                            </div>
                        </dl>
                    </section>

                    <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold text-slate-950">Accounting details</h2>
                            <p className="mt-1 text-sm text-slate-500">Enter the values supplied by the responsible municipal offices.</p>
                        </div>

                        {(generalError || errors.request) && (
                            <div className="mb-5 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{errors.request ?? generalError}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="obligation_request_number">Obligation Request No.</Label>
                                <Input
                                    id="obligation_request_number"
                                    value={data.obligation_request_number}
                                    onChange={(event) => update('obligation_request_number', event.target.value)}
                                    maxLength={60}
                                    className="mt-1.5"
                                    placeholder="e.g. 200-2026-08-"
                                />
                                <FieldError field="obligation_request_number" />
                            </div>
                            <div>
                                <Label htmlFor="responsibility_center">Responsibility Center</Label>
                                <Input
                                    id="responsibility_center"
                                    value={data.responsibility_center}
                                    onChange={(event) => update('responsibility_center', event.target.value)}
                                    maxLength={80}
                                    className="mt-1.5"
                                    placeholder="e.g. 7611"
                                />
                                <FieldError field="responsibility_center" />
                            </div>
                            <div>
                                <Label htmlFor="account_code">Account Code</Label>
                                <Input
                                    id="account_code"
                                    value={data.account_code}
                                    onChange={(event) => update('account_code', event.target.value)}
                                    maxLength={80}
                                    className="mt-1.5"
                                    placeholder="e.g. 5-02-99-080"
                                />
                                <FieldError field="account_code" />
                            </div>
                            <div>
                                <Label htmlFor="office">Office (optional)</Label>
                                <Input
                                    id="office"
                                    value={data.office}
                                    onChange={(event) => update('office', event.target.value)}
                                    maxLength={150}
                                    className="mt-1.5"
                                />
                                <FieldError field="office" />
                            </div>
                            <div>
                                <Label htmlFor="fpp">F.P.P. (optional)</Label>
                                <Input
                                    id="fpp"
                                    value={data.fpp}
                                    onChange={(event) => update('fpp', event.target.value)}
                                    maxLength={80}
                                    className="mt-1.5"
                                />
                                <FieldError field="fpp" />
                            </div>
                        </div>

                        <div className="mt-5">
                            <Label htmlFor="particulars">Particulars</Label>
                            <Textarea
                                id="particulars"
                                value={data.particulars}
                                onChange={(event) => update('particulars', event.target.value)}
                                maxLength={1000}
                                rows={5}
                                className="mt-1.5 resize-y"
                            />
                            <div className="mt-1 flex items-start justify-between gap-3">
                                <FieldError field="particulars" />
                                <span className="ml-auto text-xs text-slate-400">{data.particulars.length}/1000</span>
                            </div>
                        </div>

                        <div className="mt-7 border-t border-slate-200 pt-6">
                            <h2 className="mb-4 text-base font-semibold text-slate-950">Printed signatories</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold text-slate-700">MSWDO / Requesting Office</legend>
                                    <div>
                                        <Label htmlFor="mswdo_printed_name">Printed name</Label>
                                        <Input
                                            id="mswdo_printed_name"
                                            value={data.mswdo_printed_name}
                                            onChange={(event) => update('mswdo_printed_name', event.target.value)}
                                            maxLength={150}
                                            className="mt-1.5"
                                        />
                                        <FieldError field="mswdo_printed_name" />
                                    </div>
                                    <div>
                                        <Label htmlFor="mswdo_position">Position</Label>
                                        <Input
                                            id="mswdo_position"
                                            value={data.mswdo_position}
                                            onChange={(event) => update('mswdo_position', event.target.value)}
                                            maxLength={150}
                                            className="mt-1.5"
                                        />
                                        <FieldError field="mswdo_position" />
                                    </div>
                                </fieldset>

                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold text-slate-700">Budget Office</legend>
                                    <div>
                                        <Label htmlFor="budget_officer_printed_name">Printed name</Label>
                                        <Input
                                            id="budget_officer_printed_name"
                                            value={data.budget_officer_printed_name}
                                            onChange={(event) => update('budget_officer_printed_name', event.target.value)}
                                            maxLength={150}
                                            className="mt-1.5"
                                        />
                                        <FieldError field="budget_officer_printed_name" />
                                    </div>
                                    <div>
                                        <Label htmlFor="budget_officer_position">Position</Label>
                                        <Input
                                            id="budget_officer_position"
                                            value={data.budget_officer_position}
                                            onChange={(event) => update('budget_officer_position', event.target.value)}
                                            maxLength={150}
                                            className="mt-1.5"
                                        />
                                        <FieldError field="budget_officer_position" />
                                    </div>
                                </fieldset>
                            </div>
                        </div>

                        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                            <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                                <Link href={detailUrl}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                                {processing ? 'Generating...' : 'Generate and download PDF'}
                            </Button>
                        </div>
                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}
