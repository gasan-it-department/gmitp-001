import GenerateFinancialDocumentPacketController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/GenerateFinancialDocumentPacketController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { AssistanceGeneratedDocument } from '@/Core/Types/ActionCenter/assistance';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, ArrowLeft, BadgeCheck, FileDown, Files, Info, Landmark, Loader2, ReceiptText, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface FinancialDocumentPacketContext {
    assistance_request_id: string;
    transaction_number: string;
    payee: string;
    certificate_subject: string | null;
    address: string;
    assistance_type: string;
    approved_amount: number;
    suggested_particulars: string;
    suggested_explanation: string;
    included_documents: {
        key: AssistanceGeneratedDocument;
        label: string;
    }[];
    recommended_defaults: {
        obligation_request_number: string;
        responsibility_center: string;
        account_code: string;
        office: string;
        fpp: string;
        mswdo_printed_name: string;
        mswdo_position: string;
        budget_officer_printed_name: string;
        budget_officer_position: string;
        accountant_printed_name: string;
        accountant_position: string;
        treasurer_printed_name: string;
        treasurer_position: string;
        mayor_printed_name: string;
        mayor_position: string;
    };
}

interface Props {
    financialDocumentPacket: FinancialDocumentPacketContext;
}

interface FormData {
    intake_date: string;
    obligation_request_number: string;
    responsibility_center: string;
    account_code: string;
    office: string;
    fpp: string;
    particulars: string;
    disbursement_voucher_number: string;
    mode_of_payment: string;
    tin_employee_number: string;
    explanation: string;
    mswdo_printed_name: string;
    mswdo_position: string;
    budget_officer_printed_name: string;
    budget_officer_position: string;
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

export default function FinancialDocumentPacketGenerator({ financialDocumentPacket }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const defaults = financialDocumentPacket.recommended_defaults;
    const includedDocumentKeys = new Set(financialDocumentPacket.included_documents.map((document) => document.key));
    const hasCertificate = includedDocumentKeys.has('certificate_of_eligibility');
    const hasObligationRequest = includedDocumentKeys.has('obligation_request');
    const hasDisbursementVoucher = includedDocumentKeys.has('disbursement_voucher');
    const [data, setData] = useState<FormData>({
        intake_date: '',
        obligation_request_number: defaults.obligation_request_number,
        responsibility_center: defaults.responsibility_center,
        account_code: defaults.account_code,
        office: defaults.office,
        fpp: defaults.fpp,
        particulars: financialDocumentPacket.suggested_particulars,
        disbursement_voucher_number: '',
        mode_of_payment: '',
        tin_employee_number: '',
        explanation: financialDocumentPacket.suggested_explanation,
        mswdo_printed_name: defaults.mswdo_printed_name,
        mswdo_position: defaults.mswdo_position,
        budget_officer_printed_name: defaults.budget_officer_printed_name,
        budget_officer_position: defaults.budget_officer_position,
        accountant_printed_name: defaults.accountant_printed_name,
        accountant_position: defaults.accountant_position,
        treasurer_printed_name: defaults.treasurer_printed_name,
        treasurer_position: defaults.treasurer_position,
        mayor_printed_name: defaults.mayor_printed_name,
        mayor_position: defaults.mayor_position,
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const detailUrl = ShowAssistanceRequestProfileController.url({
        municipality: currentMunicipality.slug,
        assistanceRequest: financialDocumentPacket.assistance_request_id,
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
        const filename = match?.[1] ?? `financial-document-packet_${financialDocumentPacket.transaction_number}.pdf`;
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
                GenerateFinancialDocumentPacketController.url({
                    municipality: currentMunicipality.slug,
                    assistanceRequestId: financialDocumentPacket.assistance_request_id,
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
            setGeneralError(payload?.message ?? 'The financial document packet could not be generated. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const FieldError = ({ field }: { field: keyof FieldErrors }) =>
        errors[field] ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p> : null;

    const RecommendedHint = () => <p className="mt-1 text-xs text-slate-500">Recommended value - verify before printing.</p>;
    const signatories = (
        [
            ['mswdo', 'MSWDO / Certified By', data.mswdo_printed_name, data.mswdo_position],
            ['budget_officer', 'Budget Officer', data.budget_officer_printed_name, data.budget_officer_position],
            ['accountant', 'Municipal Accountant', data.accountant_printed_name, data.accountant_position],
            ['treasurer', 'Municipal Treasurer', data.treasurer_printed_name, data.treasurer_position],
            ['mayor', 'Mayor / Approved By', data.mayor_printed_name, data.mayor_position],
        ] as const
    ).filter(([key]) => {
        if (key === 'mswdo') return hasCertificate || hasObligationRequest;
        if (key === 'budget_officer') return hasObligationRequest;
        if (key === 'accountant' || key === 'treasurer') return hasDisbursementVoucher;

        return hasCertificate || hasDisbursementVoucher;
    });

    return (
        <AdminLayout>
            <Head title={`Generate Processing Document Packet - ${financialDocumentPacket.transaction_number}`} />

            <div className="min-h-screen bg-slate-50 pb-20">
                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
                        <Link href={detailUrl} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="h-4 w-4" />
                            Back to request
                        </Link>
                    </div>
                </div>

                <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
                    <div className="mb-6 flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                            <Files className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Generate Processing Document Packet</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {financialDocumentPacket.included_documents.map((document) => document.label).join(', ')}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 flex gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                        <Info className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            Only the enabled processing documents listed above will be generated. Shared values are applied consistently across the
                            included documents. The entered values and generated packet are not saved; verify everything before printing.
                        </p>
                    </div>

                    <section className="mb-6 rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold text-slate-900">Trusted request information</h2>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Transaction</dt>
                                <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">{financialDocumentPacket.transaction_number}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Payee</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{financialDocumentPacket.payee}</dd>
                            </div>
                            {hasCertificate && (
                                <div>
                                    <dt className="text-xs font-medium text-slate-500">Certificate subject</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900">{financialDocumentPacket.certificate_subject}</dd>
                                </div>
                            )}
                            <div className="sm:col-span-2">
                                <dt className="text-xs font-medium text-slate-500">Address</dt>
                                <dd className="mt-1 text-sm text-slate-800">{financialDocumentPacket.address}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Approved amount</dt>
                                <dd className="mt-1 text-base font-bold text-emerald-700">
                                    {currency.format(financialDocumentPacket.approved_amount)}
                                </dd>
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
                            <div className="mb-5 flex items-start gap-3">
                                <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
                                <div>
                                    <h2 className="font-semibold text-slate-950">Shared packet information</h2>
                                    <p className="mt-1 text-sm text-slate-500">These values feed every document where the same fact is required.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {hasCertificate && (
                                    <div>
                                        <Label htmlFor="intake_date">Intake date</Label>
                                        <Input
                                            id="intake_date"
                                            type="date"
                                            value={data.intake_date}
                                            onChange={(e) => update('intake_date', e.target.value)}
                                            required
                                            className="mt-1.5"
                                        />
                                        <FieldError field="intake_date" />
                                    </div>
                                )}
                                <div>
                                    <Label htmlFor="obligation_request_number">Obligation Request No.</Label>
                                    <Input
                                        id="obligation_request_number"
                                        value={data.obligation_request_number}
                                        onChange={(e) => update('obligation_request_number', e.target.value)}
                                        maxLength={60}
                                        required
                                        className="mt-1.5"
                                    />
                                    <RecommendedHint />
                                    <FieldError field="obligation_request_number" />
                                </div>
                                <div>
                                    <Label htmlFor="responsibility_center">Responsibility Center</Label>
                                    <Input
                                        id="responsibility_center"
                                        value={data.responsibility_center}
                                        onChange={(e) => update('responsibility_center', e.target.value)}
                                        maxLength={80}
                                        required
                                        className="mt-1.5"
                                    />
                                    <RecommendedHint />
                                    <FieldError field="responsibility_center" />
                                </div>
                                <div>
                                    <Label htmlFor="office">Office / Unit / Project (optional)</Label>
                                    <Input
                                        id="office"
                                        value={data.office}
                                        onChange={(e) => update('office', e.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="office" />
                                </div>
                            </div>
                        </section>

                        {hasObligationRequest && (
                            <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                                <div className="mb-5 flex items-start gap-3">
                                    <Landmark className="mt-0.5 h-5 w-5 text-slate-700" />
                                    <div>
                                        <h2 className="font-semibold text-slate-950">Obligation Request details</h2>
                                        <p className="mt-1 text-sm text-slate-500">Values used only by Annex B.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="account_code">Account Code</Label>
                                        <Input
                                            id="account_code"
                                            value={data.account_code}
                                            onChange={(e) => update('account_code', e.target.value)}
                                            maxLength={80}
                                            required
                                            className="mt-1.5"
                                        />
                                        <RecommendedHint />
                                        <FieldError field="account_code" />
                                    </div>
                                    <div>
                                        <Label htmlFor="fpp">F.P.P. (optional)</Label>
                                        <Input
                                            id="fpp"
                                            value={data.fpp}
                                            onChange={(e) => update('fpp', e.target.value)}
                                            maxLength={80}
                                            className="mt-1.5"
                                        />
                                        <FieldError field="fpp" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="particulars">Particulars</Label>
                                        <Textarea
                                            id="particulars"
                                            value={data.particulars}
                                            onChange={(e) => update('particulars', e.target.value)}
                                            maxLength={1000}
                                            rows={5}
                                            required
                                            className="mt-1.5 resize-y"
                                        />
                                        <FieldError field="particulars" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {hasDisbursementVoucher && (
                            <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                                <div className="mb-5 flex items-start gap-3">
                                    <ReceiptText className="mt-0.5 h-5 w-5 text-blue-700" />
                                    <div>
                                        <h2 className="font-semibold text-slate-950">Disbursement Voucher details</h2>
                                        <p className="mt-1 text-sm text-slate-500">Values used only by Annex A.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="disbursement_voucher_number">DV No. (optional)</Label>
                                        <Input
                                            id="disbursement_voucher_number"
                                            value={data.disbursement_voucher_number}
                                            onChange={(e) => update('disbursement_voucher_number', e.target.value)}
                                            maxLength={60}
                                            className="mt-1.5"
                                        />
                                        <FieldError field="disbursement_voucher_number" />
                                    </div>
                                    <div>
                                        <Label htmlFor="tin_employee_number">TIN / Employee No. (optional)</Label>
                                        <Input
                                            id="tin_employee_number"
                                            value={data.tin_employee_number}
                                            onChange={(e) => update('tin_employee_number', e.target.value)}
                                            maxLength={50}
                                            className="mt-1.5"
                                        />
                                        <FieldError field="tin_employee_number" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label>Mode of payment</Label>
                                        <RadioGroup
                                            value={data.mode_of_payment}
                                            onValueChange={(value) => update('mode_of_payment', value)}
                                            className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"
                                        >
                                            {paymentModes.map((mode) => (
                                                <label
                                                    key={mode.value}
                                                    htmlFor={`packet_mode_${mode.value}`}
                                                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition ${data.mode_of_payment === mode.value ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                                                >
                                                    <RadioGroupItem id={`packet_mode_${mode.value}`} value={mode.value} />
                                                    {mode.label}
                                                </label>
                                            ))}
                                        </RadioGroup>
                                        <FieldError field="mode_of_payment" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="explanation">Explanation</Label>
                                        <Textarea
                                            id="explanation"
                                            value={data.explanation}
                                            onChange={(e) => update('explanation', e.target.value)}
                                            maxLength={1000}
                                            rows={6}
                                            required
                                            className="mt-1.5 resize-y"
                                        />
                                        <FieldError field="explanation" />
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                            <div className="mb-5 flex items-start gap-3">
                                <Users className="mt-0.5 h-5 w-5 text-slate-700" />
                                <div>
                                    <h2 className="font-semibold text-slate-950">Printed signatories</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        MSWDO and Mayor values are reused across their applicable documents.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {signatories.map(([key, title, name, position]) => (
                                    <div
                                        key={key}
                                        className="border-t border-slate-200 pt-4 first:border-t-0 first:pt-0 sm:first:border-t sm:first:pt-4"
                                    >
                                        <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor={`${key}_printed_name`}>Printed name</Label>
                                                <Input
                                                    id={`${key}_printed_name`}
                                                    value={name}
                                                    onChange={(e) => update(`${key}_printed_name` as keyof FormData, e.target.value)}
                                                    maxLength={150}
                                                    required
                                                    className="mt-1.5"
                                                />
                                                <FieldError field={`${key}_printed_name` as keyof FieldErrors} />
                                            </div>
                                            <div>
                                                <Label htmlFor={`${key}_position`}>Position</Label>
                                                <Input
                                                    id={`${key}_position`}
                                                    value={position}
                                                    onChange={(e) => update(`${key}_position` as keyof FormData, e.target.value)}
                                                    maxLength={150}
                                                    required
                                                    className="mt-1.5"
                                                />
                                                <RecommendedHint />
                                                <FieldError field={`${key}_position` as keyof FieldErrors} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline" className="min-h-11 sm:min-w-32">
                                <Link href={detailUrl}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="min-h-11 bg-slate-900 text-white hover:bg-slate-800 sm:min-w-64">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                                {processing
                                    ? 'Generating packet...'
                                    : `Generate ${financialDocumentPacket.included_documents.length}-document PDF packet`}
                            </Button>
                        </div>
                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}
