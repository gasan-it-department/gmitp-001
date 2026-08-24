import GenerateDisbursementVoucherController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/GenerateDisbursementVoucherController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, ArrowLeft, FileDown, Info, Loader2, ReceiptText } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface DisbursementVoucherContext {
    assistance_request_id: string;
    transaction_number: string;
    payee: string;
    address: string;
    assistance_type: string;
    approved_amount: number;
    suggested_explanation: string;
    recommended_defaults: {
        responsibility_center_office: string;
        responsibility_center_code: string;
        accountant_printed_name: string;
        accountant_position: string;
        treasurer_printed_name: string;
        treasurer_position: string;
        mayor_printed_name: string;
        mayor_position: string;
    };
}

interface Props {
    disbursementVoucher: DisbursementVoucherContext;
}

interface FormData {
    disbursement_voucher_number: string;
    mode_of_payment: string;
    tin_employee_number: string;
    obligation_request_number: string;
    responsibility_center_office: string;
    responsibility_center_code: string;
    explanation: string;
    accountant_printed_name: string;
    accountant_position: string;
    treasurer_printed_name: string;
    treasurer_position: string;
    mayor_printed_name: string;
    mayor_position: string;
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

const paymentModes = [
    { value: 'check', label: 'Check' },
    { value: 'cash', label: 'Cash' },
    { value: 'others', label: 'Others' },
] as const;

export default function DisbursementVoucherGenerator({ disbursementVoucher }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [data, setData] = useState<FormData>({
        disbursement_voucher_number: '',
        mode_of_payment: '',
        tin_employee_number: '',
        obligation_request_number: '',
        responsibility_center_office: disbursementVoucher.recommended_defaults.responsibility_center_office,
        responsibility_center_code: disbursementVoucher.recommended_defaults.responsibility_center_code,
        explanation: disbursementVoucher.suggested_explanation,
        accountant_printed_name: disbursementVoucher.recommended_defaults.accountant_printed_name,
        accountant_position: disbursementVoucher.recommended_defaults.accountant_position,
        treasurer_printed_name: disbursementVoucher.recommended_defaults.treasurer_printed_name,
        treasurer_position: disbursementVoucher.recommended_defaults.treasurer_position,
        mayor_printed_name: disbursementVoucher.recommended_defaults.mayor_printed_name,
        mayor_position: disbursementVoucher.recommended_defaults.mayor_position,
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const detailUrl = ShowAssistanceRequestProfileController.url({
        municipality: currentMunicipality.slug,
        assistanceRequest: disbursementVoucher.assistance_request_id,
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
        const filename = match?.[1] ?? `disbursement-voucher_${disbursementVoucher.transaction_number}.pdf`;
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
                GenerateDisbursementVoucherController.url({
                    municipality: currentMunicipality.slug,
                    assistanceRequestId: disbursementVoucher.assistance_request_id,
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
            setGeneralError(payload?.message ?? 'The Disbursement Voucher could not be generated. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const FieldError = ({ field }: { field: keyof FieldErrors }) =>
        errors[field] ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p> : null;

    return (
        <AdminLayout>
            <Head title={`Disbursement Voucher - ${disbursementVoucher.transaction_number}`} />

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
                            <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Generate Disbursement Voucher</h1>
                            <p className="mt-1 text-sm break-words text-slate-500">Transaction {disbursementVoucher.transaction_number}</p>
                        </div>
                    </div>

                    <div className="mb-6 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <Info className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            The accounting values and generated PDF are not saved. Confirm them against the paper record before printing. Generating
                            this voucher does not mark the assistance as released.
                        </p>
                    </div>

                    <section className="mb-6 rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold text-slate-900">Request details</h2>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Payee</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{disbursementVoucher.payee}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Assistance type</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{disbursementVoucher.assistance_type}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Address</dt>
                                <dd className="mt-1 text-sm text-slate-800">{disbursementVoucher.address}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Approved amount</dt>
                                <dd className="mt-1 text-base font-bold text-slate-950">{currency.format(disbursementVoucher.approved_amount)}</dd>
                            </div>
                        </dl>
                    </section>

                    <form onSubmit={submit} className="space-y-6">
                        {(generalError || errors.request) && (
                            <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{errors.request ?? generalError}</span>
                            </div>
                        )}

                        <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-slate-950">Voucher details</h2>
                                <p className="mt-1 text-sm text-slate-500">Enter the values supplied by Accounting, Budget, or Treasury.</p>
                                <p className="mt-1 text-xs font-medium text-amber-700">
                                    Recommended values are prefilled. Verify them before printing.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="disbursement_voucher_number">Disbursement Voucher No. (optional)</Label>
                                    <Input
                                        id="disbursement_voucher_number"
                                        value={data.disbursement_voucher_number}
                                        onChange={(event) => update('disbursement_voucher_number', event.target.value)}
                                        maxLength={60}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="disbursement_voucher_number" />
                                </div>
                                <div>
                                    <Label htmlFor="tin_employee_number">TIN/Employee No. (optional)</Label>
                                    <Input
                                        id="tin_employee_number"
                                        value={data.tin_employee_number}
                                        onChange={(event) => update('tin_employee_number', event.target.value)}
                                        maxLength={50}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="tin_employee_number" />
                                </div>
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
                                    <Label htmlFor="responsibility_center_code">Responsibility Center Code</Label>
                                    <Input
                                        id="responsibility_center_code"
                                        value={data.responsibility_center_code}
                                        onChange={(event) => update('responsibility_center_code', event.target.value)}
                                        maxLength={80}
                                        className="mt-1.5"
                                        placeholder="e.g. 7611"
                                    />
                                    <FieldError field="responsibility_center_code" />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="responsibility_center_office">Office/Unit/Project (optional)</Label>
                                    <Input
                                        id="responsibility_center_office"
                                        value={data.responsibility_center_office}
                                        onChange={(event) => update('responsibility_center_office', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                        placeholder="e.g. Municipal Social Welfare and Development Office"
                                    />
                                    <FieldError field="responsibility_center_office" />
                                </div>
                            </div>

                            <div className="mt-5">
                                <Label>Mode of payment</Label>
                                <RadioGroup
                                    value={data.mode_of_payment}
                                    onValueChange={(value) => update('mode_of_payment', value)}
                                    className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"
                                >
                                    {paymentModes.map((mode) => (
                                        <label
                                            key={mode.value}
                                            htmlFor={`mode_${mode.value}`}
                                            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition ${
                                                data.mode_of_payment === mode.value
                                                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <RadioGroupItem id={`mode_${mode.value}`} value={mode.value} />
                                            {mode.label}
                                        </label>
                                    ))}
                                </RadioGroup>
                                <FieldError field="mode_of_payment" />
                            </div>

                            <div className="mt-5">
                                <Label htmlFor="explanation">Explanation</Label>
                                <Textarea
                                    id="explanation"
                                    value={data.explanation}
                                    onChange={(event) => update('explanation', event.target.value)}
                                    maxLength={1000}
                                    rows={7}
                                    className="mt-1.5 resize-y"
                                />
                                <div className="mt-1 flex items-start justify-between gap-3">
                                    <FieldError field="explanation" />
                                    <span className="ml-auto text-xs text-slate-400">{data.explanation.length}/1000</span>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-slate-950">Printed signatories</h2>
                                <p className="mt-1 text-sm text-slate-500">Signatures and dates remain blank on the generated document.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="accountant_printed_name">Accountant printed name</Label>
                                    <Input
                                        id="accountant_printed_name"
                                        value={data.accountant_printed_name}
                                        onChange={(event) => update('accountant_printed_name', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="accountant_printed_name" />
                                </div>
                                <div>
                                    <Label htmlFor="accountant_position">Accountant position</Label>
                                    <Input
                                        id="accountant_position"
                                        value={data.accountant_position}
                                        onChange={(event) => update('accountant_position', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="accountant_position" />
                                </div>
                                <div>
                                    <Label htmlFor="treasurer_printed_name">Treasurer printed name</Label>
                                    <Input
                                        id="treasurer_printed_name"
                                        value={data.treasurer_printed_name}
                                        onChange={(event) => update('treasurer_printed_name', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="treasurer_printed_name" />
                                </div>
                                <div>
                                    <Label htmlFor="treasurer_position">Treasurer position</Label>
                                    <Input
                                        id="treasurer_position"
                                        value={data.treasurer_position}
                                        onChange={(event) => update('treasurer_position', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="treasurer_position" />
                                </div>
                                <div>
                                    <Label htmlFor="mayor_printed_name">Mayor/Agency Head printed name</Label>
                                    <Input
                                        id="mayor_printed_name"
                                        value={data.mayor_printed_name}
                                        onChange={(event) => update('mayor_printed_name', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="mayor_printed_name" />
                                </div>
                                <div>
                                    <Label htmlFor="mayor_position">Mayor/Agency Head position</Label>
                                    <Input
                                        id="mayor_position"
                                        value={data.mayor_position}
                                        onChange={(event) => update('mayor_position', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="mayor_position" />
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline" className="min-h-11 sm:min-w-32">
                                <Link href={detailUrl}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="min-h-11 bg-blue-700 text-white hover:bg-blue-800 sm:min-w-56">
                                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                {processing ? 'Generating...' : 'Generate PDF'}
                            </Button>
                        </div>
                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}
