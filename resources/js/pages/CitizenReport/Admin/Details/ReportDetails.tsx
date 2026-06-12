import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import AppLayout from '@/layouts/App/AppLayout';
import communityReport from '@/routes/api/communityReport';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Circle, Clock, EyeOff, MapPin, PlayCircle, ShieldCheck, User as UserIcon, XCircle } from 'lucide-react';
import React, { useState } from 'react';

type EnumOption = { value: string; label: string };

type ReporterShape = { id: string; full_name: string } | null;

interface EvidencePhoto {
    id: number | string;
    name: string;
    mime_type: string;
    size: number;
    url: string;
}

interface AuditEntry {
    id: number | string;
    event: string | null;
    description: string | null;
    properties: Record<string, unknown>;
    causer_id: string | null;
    created_at: string | null;
}

interface AdminReportDetailsShape {
    id: string;
    category: EnumOption;
    status: EnumOption;
    location_text: string;
    latitude: number | string | null;
    longitude: number | string | null;
    description: string;
    is_anonymous: boolean;
    reporter: ReporterShape;
    created_at: string | null;
    acknowledged_at: string | null;
    in_progress_at: string | null;
    resolved_at: string | null;
    rejected_at: string | null;
    evidence_photos: EvidencePhoto[];
    audit_log: AuditEntry[];
}

interface ReportDetailsProps {
    report: AdminReportDetailsShape;
}

const statusBadgeClasses = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
        case 'acknowledged':
            return 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-300';
        case 'in_progress':
            return 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-300';
        case 'resolved':
            return 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-300';
        case 'rejected':
            return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300';
        default:
            return 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300';
    }
};

interface TimelineStep {
    key: string;
    label: string;
    description: string;
    at: string | null;
    reached: boolean;
}

const buildTimeline = (r: AdminReportDetailsShape): TimelineStep[] => {
    const steps: TimelineStep[] = [
        {
            key: 'submitted',
            label: 'Submitted',
            description: 'Report received from citizen.',
            at: r.created_at,
            reached: true,
        },
        {
            key: 'acknowledged',
            label: 'Acknowledged',
            description: 'Confirmed as valid by staff.',
            at: r.acknowledged_at,
            reached: r.acknowledged_at !== null,
        },
        {
            key: 'in_progress',
            label: 'In Progress',
            description: 'Work has started on resolving the issue.',
            at: r.in_progress_at,
            reached: r.in_progress_at !== null,
        },
        {
            key: 'resolved',
            label: 'Resolved',
            description: 'Issue marked as resolved.',
            at: r.resolved_at,
            reached: r.resolved_at !== null,
        },
    ];

    if (r.rejected_at !== null) {
        steps.push({
            key: 'rejected',
            label: 'Rejected',
            description: 'Report was rejected by municipal staff.',
            at: r.rejected_at,
            reached: true,
        });
    }

    return steps;
};

const stepIcon = (key: string, reached: boolean) => {
    const baseClass = reached ? 'text-white' : 'text-slate-400';
    const size = 'h-5 w-5';
    switch (key) {
        case 'submitted':
            return <ShieldCheck className={`${baseClass} ${size}`} />;
        case 'acknowledged':
            return reached ? <CheckCircle2 className={`${baseClass} ${size}`} /> : <Circle className={`${baseClass} ${size}`} />;
        case 'in_progress':
            return <Clock className={`${baseClass} ${size}`} />;
        case 'resolved':
            return <CheckCircle2 className={`${baseClass} ${size}`} />;
        case 'rejected':
            return <XCircle className={`${baseClass} ${size}`} />;
        default:
            return <Circle className={`${baseClass} ${size}`} />;
    }
};

const stepBubbleBg = (key: string, reached: boolean): string => {
    if (!reached) return 'bg-slate-200';
    if (key === 'rejected') return 'bg-red-500';
    if (key === 'resolved') return 'bg-green-500';
    if (key === 'in_progress') return 'bg-blue-500';
    if (key === 'acknowledged') return 'bg-indigo-500';
    return 'bg-slate-700';
};

export default function ReportDetails({ report }: ReportDetailsProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;

    const [activeModal, setActiveModal] = useState<'acknowledge' | 'start' | 'resolve' | 'reject' | null>(null);

    const hasCoordinates = report.latitude !== null && report.longitude !== null;
    const timeline = buildTimeline(report);

    const isTerminal = report.status.value === 'resolved' || report.status.value === 'rejected';
    const canAcknowledge = report.status.value === 'pending';
    const canStart = report.status.value === 'pending' || report.status.value === 'acknowledged';
    const canResolve = report.status.value === 'in_progress';
    const canReject = !isTerminal;

    // --- FORMS ---

    const acknowledgeForm = useForm({
        acknowledgement_note: '',
    });

    const startForm = useForm({
        assigned_to: '',
    });

    const resolveForm = useForm({
        resolution_note: '',
    });

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const handleAcknowledge = (e: React.FormEvent) => {
        e.preventDefault();
        acknowledgeForm.post(communityReport.acknowledge.url(report.id), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                setActiveModal(null);
                acknowledgeForm.reset();
            },
        });
    };

    const handleStartProgress = (e: React.FormEvent) => {
        e.preventDefault();
        startForm.post(communityReport.startProgress.url(report.id), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                setActiveModal(null);
                startForm.reset();
            },
        });
    };

    const handleResolve = (e: React.FormEvent) => {
        e.preventDefault();
        resolveForm.post(communityReport.resolve.url(report.id), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                setActiveModal(null);
                resolveForm.reset();
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(communityReport.reject.url(report.id), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            onSuccess: () => {
                setActiveModal(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Report — ${report.category.label}`} />

            <div className="mx-auto min-h-screen w-full bg-slate-50/50 p-8">
                {/* Top bar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/${slug}/admin/community-reports`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Reports
                        </Button>
                    </Link>

                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses(report.status.value)}`}
                    >
                        {report.status.label}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT: REPORT DATA */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Header card */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <p className="text-xs tracking-wide text-slate-500 uppercase">{report.category.label}</p>
                                <CardTitle className="text-2xl font-bold text-slate-900">{report.location_text}</CardTitle>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="h-3.5 w-3.5" />
                                        Filed by <b className="text-slate-700">{report.reporter?.full_name ?? 'Unknown'}</b>
                                    </span>
                                    {report.is_anonymous && (
                                        <span
                                            title="Citizen requested anonymity — do not publish this name."
                                            className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 ring-1 ring-purple-300 ring-inset"
                                        >
                                            <EyeOff className="h-3 w-3" />
                                            Anonymous to Public
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>Submitted {report.created_at ?? '—'}</span>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Description */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700">{report.description}</p>
                            </CardContent>
                        </Card>

                        {/* Location */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <p className="flex items-start gap-2 text-slate-700">
                                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                                    <span>{report.location_text}</span>
                                </p>
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">GPS Coordinates</p>
                                    {hasCoordinates ? (
                                        <div className="space-y-3">
                                            <a
                                                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 inline-block text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
                                            >
                                                {report.latitude}, {report.longitude}
                                            </a>
                                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                                <iframe
                                                    width="100%"
                                                    height="250"
                                                    style={{ border: 0 }}
                                                    loading="lazy"
                                                    src={`https://maps.google.com/maps?q=${report.latitude},${report.longitude}&z=15&output=embed`}
                                                ></iframe>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-1 text-sm text-slate-400">Not provided</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Evidence Photos */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Evidence Photos
                                    <span className="ml-2 text-xs font-normal text-slate-500">({report.evidence_photos.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {report.evidence_photos.length === 0 ? (
                                    <p className="text-sm text-slate-500">No photos were attached to this report.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                        {report.evidence_photos.map((photo) => (
                                            <a
                                                key={photo.id}
                                                href={photo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={photo.name}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                    <span className="line-clamp-1 text-[10px] font-medium text-white">{photo.name}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT: ADMIN CONTROLS + TRACKING TRAIL */}
                    <div className="space-y-6 lg:sticky lg:top-6 self-start">
                        {/* Admin Controls */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Admin Controls</CardTitle>
                                <p className="text-xs text-slate-500">Update the lifecycle status of this report.</p>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                {canAcknowledge && (
                                    <Button type="button" variant="outline" className="justify-start" onClick={() => setActiveModal('acknowledge')}>
                                        <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
                                        Acknowledge Report
                                    </Button>
                                )}
                                {canStart && (
                                    <Button type="button" variant="outline" className="justify-start" onClick={() => setActiveModal('start')}>
                                        <PlayCircle className="mr-2 h-4 w-4 text-blue-500" />
                                        Mark In Progress
                                    </Button>
                                )}
                                {canResolve && (
                                    <Button type="button" variant="outline" className="justify-start" onClick={() => setActiveModal('resolve')}>
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                        Mark Resolved
                                    </Button>
                                )}
                                {canReject && (
                                    <Button type="button" variant="destructive" className="justify-start" onClick={() => setActiveModal('reject')}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject Report
                                    </Button>
                                )}
                                {isTerminal && (
                                    <p className="text-center text-xs text-slate-500">
                                        This report is in a terminal state. No further status changes are available.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tracking Trail */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Tracking Trail</CardTitle>
                                <p className="text-xs text-slate-500">Lifecycle of this report from submission to resolution.</p>
                            </CardHeader>
                            <CardContent>
                                <ol className="relative space-y-6">
                                    {timeline.map((step, idx) => {
                                        const isLast = idx === timeline.length - 1;
                                        return (
                                            <li key={step.key} className="relative pl-10">
                                                {!isLast && (
                                                    <span
                                                        className={`absolute top-8 left-[15px] h-full w-px ${
                                                            step.reached && timeline[idx + 1]?.reached ? 'bg-slate-400' : 'bg-slate-200'
                                                        }`}
                                                        aria-hidden
                                                    />
                                                )}

                                                <span
                                                    className={`absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full ${stepBubbleBg(
                                                        step.key,
                                                        step.reached,
                                                    )}`}
                                                >
                                                    {stepIcon(step.key, step.reached)}
                                                </span>

                                                <div>
                                                    <p className={`text-sm font-semibold ${step.reached ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {step.label}
                                                    </p>
                                                    <p className={`mt-0.5 text-xs ${step.reached ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {step.description}
                                                    </p>
                                                    <p className="mt-1 text-[11px] font-medium text-slate-500">{step.at ?? 'Pending'}</p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Acknowledge Dialog */}
            <Dialog open={activeModal === 'acknowledge'} onOpenChange={() => setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Acknowledge Report</DialogTitle>
                        <DialogDescription>Confirm that this report is valid and has been received by the municipality.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAcknowledge} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="ack_note">Acknowledgement Note (Optional)</Label>
                            <Textarea
                                id="ack_note"
                                value={acknowledgeForm.data.acknowledgement_note}
                                onChange={(e) => acknowledgeForm.setData('acknowledgement_note', e.target.value)}
                                placeholder="e.g., We've dispatched a team to inspect the area."
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={acknowledgeForm.processing}>
                                Confirm Acknowledgement
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Start Progress Dialog */}
            <Dialog open={activeModal === 'start'} onOpenChange={() => setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark In Progress</DialogTitle>
                        <DialogDescription>Assign this report to a department or crew to begin work.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleStartProgress} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="assigned_to">Assigned To</Label>
                            <Input
                                id="assigned_to"
                                required
                                value={startForm.data.assigned_to}
                                onChange={(e) => startForm.setData('assigned_to', e.target.value)}
                                placeholder="e.g., DPWH Maintenance Crew A"
                            />
                            {startForm.errors.assigned_to && <p className="text-xs text-red-500">{startForm.errors.assigned_to}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={startForm.processing}>
                                Start Work
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Resolve Dialog */}
            <Dialog open={activeModal === 'resolve'} onOpenChange={() => setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Report</DialogTitle>
                        <DialogDescription>Provide details on how the issue was addressed.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResolve} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="res_note">Resolution Note</Label>
                            <Textarea
                                id="res_note"
                                required
                                value={resolveForm.data.resolution_note}
                                onChange={(e) => resolveForm.setData('resolution_note', e.target.value)}
                                placeholder="Describe how the issue was fixed..."
                            />
                            {resolveForm.errors.resolution_note && <p className="text-xs text-red-500">{resolveForm.errors.resolution_note}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={resolveForm.processing}>
                                Mark as Resolved
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={activeModal === 'reject'} onOpenChange={() => setActiveModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Reject Report</DialogTitle>
                        <DialogDescription>Are you sure you want to reject this report? This action is terminal.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rej_reason">Rejection Reason</Label>
                            <Textarea
                                id="rej_reason"
                                required
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                placeholder="Explain why the report is being rejected..."
                            />
                            {rejectForm.errors.rejection_reason && <p className="text-xs text-red-500">{rejectForm.errors.rejection_reason}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                Reject Report
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
