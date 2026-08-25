import GenerateAssistanceRequestIntakeSheetController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Document/GenerateAssistanceRequestIntakeSheetController';
import ShowAssistanceRequestProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/ShowAssistanceRequestProfileController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, ArrowLeft, ClipboardCheck, FileDown, Info, Loader2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface ProblemOption {
    value: string;
    label: string;
}

interface IntakeSheetContext {
    assistance_request_id: string;
    transaction_number: string;
    claimant_name: string;
    age_at_filing: number | null;
    civil_status: string | null;
    barangay: string | null;
    assistance_type: string;
    filing_subject: string;
    problem_options: ProblemOption[];
    recommended_defaults: {
        problem_presented: string[];
        source_of_income: string | null;
        monthly_income: number | null;
        recommendation: string;
    };
}

interface Props {
    assistanceRequestIntakeSheet: IntakeSheetContext;
}

interface FormData {
    problem_presented: string[];
    source_of_income: string;
    monthly_income: string;
    recommendation: string;
}

type FieldErrors = Partial<Record<keyof FormData | 'request', string>>;

interface ErrorPayload {
    message?: string;
    errors?: Record<string, string[] | string>;
}

export default function AssistanceRequestIntakeSheetGenerator({ assistanceRequestIntakeSheet }: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const [data, setData] = useState<FormData>({
        problem_presented: assistanceRequestIntakeSheet.recommended_defaults.problem_presented,
        source_of_income: assistanceRequestIntakeSheet.recommended_defaults.source_of_income ?? '',
        monthly_income:
            assistanceRequestIntakeSheet.recommended_defaults.monthly_income === null
                ? ''
                : String(assistanceRequestIntakeSheet.recommended_defaults.monthly_income),
        recommendation: assistanceRequestIntakeSheet.recommended_defaults.recommendation,
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const detailUrl = ShowAssistanceRequestProfileController.url({
        municipality: currentMunicipality.slug,
        assistanceRequest: assistanceRequestIntakeSheet.assistance_request_id,
    });

    const update = (field: Exclude<keyof FormData, 'problem_presented'>, value: string) => {
        setData((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const toggleProblem = (value: string, checked: boolean) => {
        setData((current) => ({
            ...current,
            problem_presented: checked
                ? Array.from(new Set([...current.problem_presented, value]))
                : current.problem_presented.filter((problem) => problem !== value),
        }));
        setErrors((current) => ({ ...current, problem_presented: undefined }));
    };

    const findingsPreview = useMemo(() => {
        const income = data.monthly_income.trim() === '' ? '__________' : `PHP ${Number(data.monthly_income).toLocaleString('en-PH')}`;
        const source = data.source_of_income.trim() || '________________';
        const recommendation = data.recommendation.trim() || '________________';

        return `The client Mr./Mrs./Ms. ${assistanceRequestIntakeSheet.claimant_name}, ${assistanceRequestIntakeSheet.age_at_filing ?? '___'} years old; ${assistanceRequestIntakeSheet.civil_status ?? '________'} and resident of Barangay ${assistanceRequestIntakeSheet.barangay ?? '________'} is seeking ${assistanceRequestIntakeSheet.assistance_type} for his/her ${assistanceRequestIntakeSheet.filing_subject} based on the information gathered, the family's basic source of income only derives from ${source} with a monthly income of ${income} which is very insufficient for the family's daily supply of food, medicines and other expenses which are necessary for one family to survive. In view of this the undersigned strongly recommended ${recommendation}.`;
    }, [assistanceRequestIntakeSheet, data.monthly_income, data.recommendation, data.source_of_income]);

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
        const filename = match?.[1] ?? `assistance-request-intake_${assistanceRequestIntakeSheet.transaction_number}.pdf`;
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
                GenerateAssistanceRequestIntakeSheetController.url({
                    municipality: currentMunicipality.slug,
                    assistanceRequestId: assistanceRequestIntakeSheet.assistance_request_id,
                }),
                {
                    ...data,
                    monthly_income: data.monthly_income.trim() === '' ? null : data.monthly_income,
                },
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
            setGeneralError(payload?.message ?? 'The request intake sheet could not be generated. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const FieldError = ({ field }: { field: keyof FieldErrors }) =>
        errors[field] ? <p className="mt-1 text-sm text-red-600">{errors[field]}</p> : null;

    return (
        <AdminLayout>
            <Head title={`Prepare Intake Sheet - ${assistanceRequestIntakeSheet.transaction_number}`} />

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
                            <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Prepare Request Intake Sheet</h1>
                            <p className="mt-1 text-sm break-words text-slate-500">Transaction {assistanceRequestIntakeSheet.transaction_number}</p>
                        </div>
                    </div>

                    <div className="mb-6 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <Info className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                            Occupation and monthly income are required and will appear in both Beneficiary Details and Findings and Evaluation.
                            These document values are not saved to the beneficiary profile or assistance request.
                        </p>
                    </div>

                    <section className="mb-6 rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold text-slate-900">Trusted request information</h2>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Claimant or assisted person</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{assistanceRequestIntakeSheet.claimant_name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Age at filing</dt>
                                <dd className="mt-1 text-sm text-slate-800">{assistanceRequestIntakeSheet.age_at_filing ?? 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Civil status</dt>
                                <dd className="mt-1 text-sm text-slate-800">{assistanceRequestIntakeSheet.civil_status ?? 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Barangay</dt>
                                <dd className="mt-1 text-sm text-slate-800">{assistanceRequestIntakeSheet.barangay ?? 'Not recorded'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Assistance type</dt>
                                <dd className="mt-1 text-sm font-semibold text-slate-900">{assistanceRequestIntakeSheet.assistance_type}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-slate-500">Filed for</dt>
                                <dd className="mt-1 text-sm text-slate-800">{assistanceRequestIntakeSheet.filing_subject}</dd>
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
                                <h2 className="text-base font-semibold text-slate-950">III. Problem Presented</h2>
                                <p className="mt-1 text-sm text-slate-500">Select every problem confirmed during the interview.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {assistanceRequestIntakeSheet.problem_options.map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-3 py-2.5 hover:bg-slate-50"
                                    >
                                        <Checkbox
                                            checked={data.problem_presented.includes(option.value)}
                                            onCheckedChange={(checked) => toggleProblem(option.value, checked === true)}
                                        />
                                        <span className="text-sm font-medium text-slate-800">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            <FieldError field="problem_presented" />
                        </section>

                        <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-slate-950">IV. Findings and Evaluation</h2>
                                <p className="mt-1 text-sm text-slate-500">Review the recommended values and correct them before printing.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="source_of_income">
                                        Occupation / basic source of income <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="source_of_income"
                                        value={data.source_of_income}
                                        onChange={(event) => update('source_of_income', event.target.value)}
                                        maxLength={255}
                                        placeholder="e.g. Farming, Fishing, Unemployed"
                                        required
                                        className="mt-1.5"
                                    />
                                    <FieldError field="source_of_income" />
                                </div>
                                <div>
                                    <Label htmlFor="monthly_income">
                                        Monthly income <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="monthly_income"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.monthly_income}
                                        onChange={(event) => update('monthly_income', event.target.value)}
                                        placeholder="Enter 0 if none"
                                        required
                                        className="mt-1.5"
                                    />
                                    <FieldError field="monthly_income" />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="recommendation">Recommendation</Label>
                                    <Textarea
                                        id="recommendation"
                                        value={data.recommendation}
                                        onChange={(event) => update('recommendation', event.target.value)}
                                        maxLength={1000}
                                        rows={4}
                                        className="mt-1.5 resize-y"
                                    />
                                    <div className="mt-1 flex items-start justify-between gap-3">
                                        <FieldError field="recommendation" />
                                        <span className="ml-auto text-xs text-slate-400">{data.recommendation.length}/1000</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
                            <h2 className="text-sm font-semibold text-slate-900">Findings preview</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-700">{findingsPreview}</p>
                        </section>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline" className="min-h-11 sm:min-w-32">
                                <Link href={detailUrl}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="min-h-11 bg-slate-900 text-white hover:bg-slate-800 sm:min-w-52">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                                {processing ? 'Generating...' : 'Generate Intake Sheet'}
                            </Button>
                        </div>
                    </form>
                </main>
            </div>
        </AdminLayout>
    );
}
