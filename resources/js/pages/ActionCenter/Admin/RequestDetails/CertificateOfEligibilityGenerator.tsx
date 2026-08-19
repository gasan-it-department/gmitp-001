import GenerateCertificateOfEligibilityController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/GenerateCertificateOfEligibilityController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, ArrowLeft, BadgeCheck, FileDown, Info, Loader2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface CertificateOfEligibilityContext {
    assistance_request_id: string;
    transaction_number: string;
    subject_name: string;
    subject_birth_date: string | null;
    subject_civil_status: string | null;
    address: string;
    assistance_type: string;
}

interface Props {
    certificateOfEligibility: CertificateOfEligibilityContext;
}

interface FormData {
    intake_date: string;
    certified_by_name: string;
    certified_by_position: string;
    approved_by_name: string;
    approved_by_position: string;
}

type FieldErrors = Partial<Record<keyof FormData | 'request', string>>;

interface ErrorPayload {
    message?: string;
    errors?: Record<string, string[] | string>;
}

export default function CertificateOfEligibilityGenerator({ certificateOfEligibility }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [data, setData] = useState<FormData>({
        intake_date: '',
        certified_by_name: '',
        certified_by_position: '',
        approved_by_name: '',
        approved_by_position: '',
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const detailUrl = ShowAssistanceRequestProfileController.url({
        municipality: currentMunicipality.slug,
        assistanceRequest: certificateOfEligibility.assistance_request_id,
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
        const filename = match?.[1] ?? `certificate-of-eligibility_${certificateOfEligibility.transaction_number}.pdf`;
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
                GenerateCertificateOfEligibilityController.url({
                    municipality: currentMunicipality.slug,
                    assistanceRequestId: certificateOfEligibility.assistance_request_id,
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
            setGeneralError(payload?.message ?? 'The Certificate of Eligibility could not be generated. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const FieldError = ({ field }: { field: keyof FieldErrors }) =>
        errors[field] ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p> : null;

    return (
        <AdminLayout>
            <Head title={`Certificate of Eligibility - ${certificateOfEligibility.transaction_number}`} />

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
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-white">
                            <BadgeCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Generate Certificate of Eligibility</h1>
                            <p className="mt-1 break-words text-sm text-slate-500">Transaction {certificateOfEligibility.transaction_number}</p>
                        </div>
                    </div>

                    <div className="mb-6 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <Info className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            The intake date and signatory values are entered for this print only and are not saved. The signed physical certificate
                            remains the official record.
                        </p>
                    </div>

                    <section className="mb-6 rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold text-slate-900">Certificate subject</h2>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Name</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{certificateOfEligibility.subject_name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Birth date</dt>
                                <dd className="mt-1 text-sm text-slate-800">{certificateOfEligibility.subject_birth_date ?? 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Civil status</dt>
                                <dd className="mt-1 text-sm text-slate-800">{certificateOfEligibility.subject_civil_status ?? 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Assistance type</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{certificateOfEligibility.assistance_type}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs font-medium text-slate-500">Frozen request address</dt>
                                <dd className="mt-1 text-sm text-slate-800">{certificateOfEligibility.address}</dd>
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
                                <h2 className="text-base font-semibold text-slate-950">Certificate details</h2>
                                <p className="mt-1 text-sm text-slate-500">Enter the date recorded on the intake and the printed signatories.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="intake_date">Intake date</Label>
                                    <Input
                                        id="intake_date"
                                        type="date"
                                        value={data.intake_date}
                                        onChange={(event) => update('intake_date', event.target.value)}
                                        className="mt-1.5 sm:max-w-xs"
                                    />
                                    <FieldError field="intake_date" />
                                </div>

                                <div>
                                    <Label htmlFor="certified_by_name">Certified By printed name</Label>
                                    <Input
                                        id="certified_by_name"
                                        value={data.certified_by_name}
                                        onChange={(event) => update('certified_by_name', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="certified_by_name" />
                                </div>
                                <div>
                                    <Label htmlFor="certified_by_position">Certified By position</Label>
                                    <Input
                                        id="certified_by_position"
                                        value={data.certified_by_position}
                                        onChange={(event) => update('certified_by_position', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="certified_by_position" />
                                </div>
                                <div>
                                    <Label htmlFor="approved_by_name">Approved By printed name</Label>
                                    <Input
                                        id="approved_by_name"
                                        value={data.approved_by_name}
                                        onChange={(event) => update('approved_by_name', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="approved_by_name" />
                                </div>
                                <div>
                                    <Label htmlFor="approved_by_position">Approved By position</Label>
                                    <Input
                                        id="approved_by_position"
                                        value={data.approved_by_position}
                                        onChange={(event) => update('approved_by_position', event.target.value)}
                                        maxLength={150}
                                        className="mt-1.5"
                                    />
                                    <FieldError field="approved_by_position" />
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline" className="min-h-11 sm:min-w-32">
                                <Link href={detailUrl}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="min-h-11 bg-emerald-700 text-white hover:bg-emerald-800 sm:min-w-56">
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
