import { Head } from '@inertiajs/react';
import { AssistanceDocumentRequirement } from '@/Core/Types/ActionCenter/assistance';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { DocumentsToBringChecklist } from '../Apply/Components/DocumentsToBringChecklist';
import { 
    Calendar, 
    CheckCircle2, 
    Clock, 
    HelpingHand, 
    Banknote,
    User,
    MapPin,
    FileText,
    ChevronLeft,
    XCircle,
    Info,
    History,
    GraduationCap,
    Heart,
    Baby
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES (Based on AssistanceRequestDetailsResource)
// ----------------------------------------------------------------------
interface AssistanceRequestDetails {
    id: string;
    transaction_number: string;
    status: string;
    assistance_type: {
        id: string;
        name: string;
        slug: string;
        description: string;
        documents: AssistanceDocumentRequirement[];
    } | null;
    amount_approved: number | null;
    description: string;
    remarks: string | null;
    privacy_consented_at: string | null;
    submitted_at: string;
    approved_at: string | null;
    released_at: string | null;
    filed_for_self: boolean;
    relationship: {
        value: string;
        label: string;
    } | null;
    on_behalf: {
        full_name: string;
        date_of_death: string | null;
        recipient_id_exception: string | null;
    } | null;
    identity_snapshot: {
        full_name: string;
        sex: string;
        birth_date: string;
        age_at_submission: number;
        educational_attainment: string;
        religion: string;
    };
    address_snapshot: {
        full_address: string;
        barangay: string;
    };
    documents: Array<{
        id: number;
        uuid: string;
        collection_name: string;
        name: string;
        file_name: string;
        mime_type: string;
        size: number;
        uploaded_at: string;
        custom_properties: {
            document_key?: string;
        };
    }>;
}

interface Props {
    request: {
        data: AssistanceRequestDetails;
    };
}

// ----------------------------------------------------------------------
// STYLES CONFIGURATION
// ----------------------------------------------------------------------
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; icon: any; label: string; accent: string }> = {
    approved: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle2,
        label: 'Approved',
        accent: 'bg-green-500'
    },
    released: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: HelpingHand,
        label: 'Released',
        accent: 'bg-blue-500'
    },
    rejected: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
        label: 'Rejected',
        accent: 'bg-red-500'
    },
    pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock,
        label: 'Awaiting Documents',
        accent: 'bg-amber-500'
    },
    under_review: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: History,
        label: 'Under Review',
        accent: 'bg-indigo-500'
    },
    cancelled: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: XCircle,
        label: 'Cancelled',
        accent: 'bg-gray-500'
    },
    default: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: Info,
        label: 'Unknown',
        accent: 'bg-gray-400'
    },
};

export default function AssistanceDetails({ request }: Props) {
    const data = request.data;
    const style = STATUS_STYLES[data.status?.toLowerCase()] || STATUS_STYLES.default;
    const StatusIcon = style.icon;
    const recordedDocumentKeys = data.documents
        .map((document) => document.custom_properties?.document_key)
        .filter((key): key is string => Boolean(key));
    const requireRecipientIdentity =
        data.on_behalf !== null &&
        data.assistance_type?.slug !== 'burial' &&
        !data.on_behalf.recipient_id_exception;

    // --- Formatters ---
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'Not yet assessed';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <PublicLayout title="Action Center" description="View details of your assistance request">
            <Head title={`Request ${data.transaction_number} - Action Center`} />

            <div className="py-12 min-h-screen bg-muted/30">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    
                    {/* TOP BAR / NAVIGATION */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.history.back()}
                                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95"
                            >
                                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">Request Profile</h1>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Reference ID: <span className="text-primary font-mono">{data.transaction_number}</span>
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-sm ${style.bg} ${style.text} ${style.border}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-widest">{style.label}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        
                        {/* LEFT COLUMN: MAIN CONTENT */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* 1. PRIMARY INFO CARD */}
                            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HelpingHand className="h-5 w-5 text-primary" />
                                        <span className="font-black uppercase tracking-wider text-sm">Program Details</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                        Submitted {formatDate(data.submitted_at)}
                                    </span>
                                </div>
                                
                                <div className="p-6">
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mb-4">
                                        {data.assistance_type?.name || 'Assistance Request'}
                                    </h2>
                                    
                                    <div className="rounded-xl bg-muted/20 border border-border p-5 mb-6">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Reason for Request</label>
                                        <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap italic">
                                            "{data.description}"
                                        </p>
                                    </div>

                                    {/* Assessment Results (If approved or rejected) */}
                                    {(data.amount_approved !== null || data.remarks) && (
                                        <div className="border-t border-border pt-6 mt-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Approved Amount</label>
                                                    <div className="flex items-center gap-2">
                                                        <Banknote className="h-5 w-5 text-green-600" />
                                                        <span className="text-xl font-black text-green-700">
                                                            {formatCurrency(data.amount_approved)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {data.remarks && (
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Admin Feedback</label>
                                                        <p className="text-xs font-bold text-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                                                            {data.remarks}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. SUBJECT OF ASSISTANCE (IDENTITY SNAPSHOT) */}
                            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <span className="font-black uppercase tracking-wider text-sm">Subject of Assistance</span>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                        <div>
                                            <p className="text-xl font-black text-foreground uppercase tracking-tight">
                                                {data.identity_snapshot.full_name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                                <span className="text-xs font-bold uppercase tracking-wide">
                                                    {data.address_snapshot.full_address}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {!data.filed_for_self && data.relationship && (
                                            <div className="rounded-lg bg-primary/10 px-3 py-2 border border-primary/20">
                                                <p className="text-[10px] font-black uppercase text-primary mb-0.5">Representative Filing</p>
                                                <p className="text-xs font-bold text-foreground">
                                                    Subject is the Filer's <span className="text-primary">{data.relationship.label}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                <Baby className="h-3 w-3" /> Age
                                            </div>
                                            <p className="text-sm font-black text-foreground">{data.identity_snapshot.age_at_submission} years old</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                <User className="h-3 w-3" /> Sex
                                            </div>
                                            <p className="text-sm font-black text-foreground uppercase">{data.identity_snapshot.sex}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                <Heart className="h-3 w-3" /> Religion
                                            </div>
                                            <p className="text-sm font-black text-foreground">{data.identity_snapshot.religion || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                <GraduationCap className="h-3 w-3" /> Education
                                            </div>
                                            <p className="text-sm font-black text-foreground line-clamp-1">{data.identity_snapshot.educational_attainment || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DocumentsToBringChecklist
                                documents={data.assistance_type?.documents ?? []}
                                requireRecipientIdentity={requireRecipientIdentity}
                                recordedDocumentKeys={recordedDocumentKeys}
                                showRecordingStatus
                            />

                            {/* 3. ATTACHMENTS SECTION */}
                            {data.documents.length > 0 && (
                            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <span className="font-black uppercase tracking-wider text-sm">Documents recorded by MSWD</span>
                                    </div>
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary border border-primary/20">
                                        {data.documents.length} Files
                                    </span>
                                </div>
                                
                                <div className="p-6">
                                    {data.documents.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {data.documents.map((doc) => (
                                                <div key={doc.id} className="group flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10 hover:border-primary/50 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-background border border-border group-hover:bg-primary/5 transition-colors">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-foreground line-clamp-1">{doc.name}</p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                {doc.mime_type.split('/')[1]} • {formatFileSize(doc.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border">
                                            <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No attachments uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}

                        </div>

                        {/* RIGHT COLUMN: SIDEBAR */}
                        <div className="space-y-8">
                            
                            {/* STATUS TIMELINE */}
                            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="bg-muted/30 px-6 py-4 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <History className="h-5 w-5 text-primary" />
                                        <span className="font-black uppercase tracking-wider text-sm">Workflow Log</span>
                                    </div>
                                </div>
                                
                                <div className="p-6 relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-[31px] top-6 bottom-6 w-px bg-border"></div>

                                    <div className="space-y-8 relative">
                                        
                                        {/* Submitted */}
                                        <div className="flex items-start gap-4">
                                            <div className="relative z-10 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-sm">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-foreground uppercase tracking-tight">Application Submitted</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatDate(data.submitted_at)}</p>
                                            </div>
                                        </div>

                                        {/* Approved / Under Review */}
                                        {data.approved_at && (
                                            <div className="flex items-start gap-4">
                                                <div className="relative z-10 h-8 w-8 rounded-full bg-background border-2 border-green-500 flex items-center justify-center shadow-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-foreground uppercase tracking-tight">Request Approved</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatDate(data.approved_at)}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Released */}
                                        {data.released_at && (
                                            <div className="flex items-start gap-4">
                                                <div className="relative z-10 h-8 w-8 rounded-full bg-background border-2 border-blue-500 flex items-center justify-center shadow-sm">
                                                    <HelpingHand className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-foreground uppercase tracking-tight">Assistance Released</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatDate(data.released_at)}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Current Status Indicator if still pending/review */}
                                        {!data.approved_at && data.status !== 'pending' && (
                                            <div className="flex items-start gap-4">
                                                <div className={`relative z-10 h-8 w-8 rounded-full bg-background border-2 ${style.border.replace('border-', 'border-')} flex items-center justify-center shadow-sm`}>
                                                    <style.icon className={`h-4 w-4 ${style.text}`} />
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-black ${style.text} uppercase tracking-tight`}>{style.label}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ongoing verification</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* PRIVACY BADGE */}
                            <div className="rounded-2xl border border-border bg-primary/5 p-6 flex flex-col items-center text-center">
                                <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-1">Data Privacy Secure</h4>
                                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                    Consented to RA 10173 on <br />
                                    <span className="font-bold text-primary">{formatDate(data.privacy_consented_at)}</span>
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border flex justify-center">
                        <button
                            onClick={() => window.history.back()}
                            className="rounded-xl border border-border bg-background px-8 py-3 text-xs font-black uppercase tracking-widest text-foreground shadow-sm transition-all hover:bg-muted hover:text-primary active:scale-95"
                        >
                            Back to My Requests
                        </button>
                    </div>

                </div>
            </div>

        </PublicLayout>
    );
}
