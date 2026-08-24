import GenerateAcknowledgementReceiptController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/GenerateAcknowledgementReceiptController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Button } from '@/components/ui/button';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, ArrowLeft, CalendarDays, FileDown, Info, Loader2, MapPin, ReceiptText, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface AcknowledgementReceiptContext {
    assistance_request_id: string;
    transaction_number: string;
    recipient_name: string;
    barangay: string;
    approved_amount: number;
    assistance_type: string;
    submitted_date: string;
    provided_date: string | null;
}

interface Props {
    acknowledgementReceipt: AcknowledgementReceiptContext;
}

interface ErrorPayload {
    message?: string;
    errors?: Record<string, string[] | string>;
}

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(`${value}T00:00:00`));

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(value);

export default function AcknowledgementReceiptGenerator({ acknowledgementReceipt }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detailUrl = ShowAssistanceRequestProfileController.url({
        municipality: currentMunicipality.slug,
        assistanceRequest: acknowledgementReceipt.assistance_request_id,
    });

    const readErrorPayload = async (requestError: unknown): Promise<ErrorPayload | null> => {
        if (!axios.isAxiosError(requestError)) return null;

        const responseData = (requestError as AxiosError<Blob | ErrorPayload>).response?.data;

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
        const filename = match?.[1] ?? `acknowledgement-receipt_${acknowledgementReceipt.transaction_number}.pdf`;
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
        setError(null);

        try {
            const response = await axios.post(
                GenerateAcknowledgementReceiptController.url({
                    municipality: currentMunicipality.slug,
                    assistanceRequestId: acknowledgementReceipt.assistance_request_id,
                }),
                {},
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
        } catch (requestError) {
            const payload = await readErrorPayload(requestError);
            const requestMessages = payload?.errors?.request;

            setError(
                (Array.isArray(requestMessages) ? requestMessages[0] : requestMessages) ??
                    payload?.message ??
                    'The Acknowledgement Receipt could not be generated. Please try again.',
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout>
            <Head title={`Acknowledgement Receipt - ${acknowledgementReceipt.transaction_number}`} />

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
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white">
                            <ReceiptText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Generate Acknowledgement Receipt</h1>
                            <p className="mt-1 text-sm break-words text-slate-500">Transaction {acknowledgementReceipt.transaction_number}</p>
                        </div>
                    </div>

                    <div className="mb-6 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <Info className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            Review the trusted request values before printing. The generated PDF is not saved by the system; the signed physical
                            receipt remains the official record.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold text-slate-950">Receipt details</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                These values come from the frozen assistance request and cannot be edited here.
                            </p>
                        </div>

                        <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <UserRound className="h-3.5 w-3.5" /> Recipient
                                </dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{acknowledgementReceipt.recipient_name}</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <MapPin className="h-3.5 w-3.5" /> Barangay
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">{acknowledgementReceipt.barangay || 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Assistance type</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{acknowledgementReceipt.assistance_type}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Approved amount</dt>
                                <dd className="mt-1 text-sm font-semibold text-emerald-700">
                                    {formatCurrency(acknowledgementReceipt.approved_amount)}
                                </dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <CalendarDays className="h-3.5 w-3.5" /> Request submitted
                                </dt>
                                <dd className="mt-1 text-sm text-slate-800">{formatDate(acknowledgementReceipt.submitted_date)}</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <CalendarDays className="h-3.5 w-3.5" /> Assistance provided
                                </dt>
                                <dd
                                    className={`mt-1 text-sm font-semibold ${acknowledgementReceipt.provided_date ? 'text-slate-900' : 'text-amber-700'}`}
                                >
                                    {acknowledgementReceipt.provided_date
                                        ? formatDate(acknowledgementReceipt.provided_date)
                                        : 'Pending release - the PDF will leave this line blank'}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <form onSubmit={submit} className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="min-h-11 sm:min-w-32">
                            <Link href={detailUrl}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="min-h-11 bg-blue-700 text-white hover:bg-blue-800 sm:min-w-56">
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                            {processing ? 'Generating...' : 'Generate PDF'}
                        </Button>
                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}
