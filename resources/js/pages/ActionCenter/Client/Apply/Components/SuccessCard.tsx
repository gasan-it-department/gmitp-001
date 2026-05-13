import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { CheckCircle2, ClipboardCopy, FileText, Home } from 'lucide-react';
import { useState } from 'react';

interface Props {
    transactionNumber: string;
    programName: string;
    portalUrl: string;
    requestsUrl: string;
}

const NEXT_STEPS = [
    {
        label: 'Document Review',
        detail: 'MSWD staff will verify your uploaded documents and assess your situation.',
    },
    {
        label: 'Interview (if needed)',
        detail: 'You may be contacted for a brief interview or asked for additional supporting documents.',
    },
    {
        label: 'LCE Approval',
        detail: 'Once assessed, the request is forwarded to the Local Chief Executive for final approval.',
    },
    {
        label: 'Release of Assistance',
        detail: 'Approved cash assistance of ₱5,000 and below is released within the day. All others within 7 working days.',
    },
];

/**
 * Shown after a successful assistance request submission.
 * Displays the transaction number and the post-submission workflow steps.
 */
export function SuccessCard({ transactionNumber, programName, portalUrl, requestsUrl }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(transactionNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg">
                {/* ── Check icon ── */}
                <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Request Submitted!</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Your <strong className="text-slate-700">{programName}</strong> request has been received
                        and is now pending review by the MSWD office.
                    </p>
                </div>

                {/* ── Transaction number ── */}
                <div className="mb-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
                    <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Transaction Number
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-black tracking-widest text-[#005088]">
                            {transactionNumber}
                        </span>
                        <button
                            onClick={handleCopy}
                            title="Copy to clipboard"
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                            <ClipboardCopy className="h-4 w-4" />
                        </button>
                    </div>
                    {copied && (
                        <p className="mt-1 text-xs font-medium text-green-600">Copied!</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                        Keep this number to follow up on your request at the MSWD office.
                    </p>
                </div>

                {/* ── What happens next ── */}
                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="mb-4 text-xs font-black tracking-widest text-slate-500 uppercase">
                        What happens next
                    </p>
                    <ol className="space-y-4">
                        {NEXT_STEPS.map((step, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#005088]/10 text-[10px] font-black text-[#005088]">
                                    {i + 1}
                                </span>
                                <div>
                                    <p className="text-xs font-semibold text-slate-800">{step.label}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.detail}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* ── Actions ── */}
                <div className="grid grid-cols-2 gap-3">
                    <Link href={portalUrl} className="block">
                        <Button
                            variant="outline"
                            className="h-12 w-full rounded-xl border-slate-200 text-sm font-semibold text-slate-700"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Back to Portal
                        </Button>
                    </Link>
                    <Link href={requestsUrl} className="block">
                        <Button className="h-12 w-full rounded-xl bg-[#005088] text-sm font-semibold text-white hover:bg-[#003d66]">
                            <FileText className="mr-2 h-4 w-4" />
                            My Requests
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
