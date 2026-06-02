import { Card, CardContent } from '@/components/ui/card';
import PublicLayout from '@/layouts/Public/wrapper/PublicLayoutTemplate';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    ChevronRight,
    MessageSquare,
    MessageSquareQuote,
    Star,
    User,
    VenetianMask,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface Attachment {
    id: string;
    name: string;
    mime_type: string;
    size: number;
    url: string;
}

interface FeedbackData {
    id: string;
    subject: string;
    message: string;
    rating: number | null;
    is_anonymous: boolean;
    citizen_name: string | null;
    employee_name: string | null;
    department: { id: string; name: string } | null;
    created_at: string;
    attachments: Attachment[];
}

interface FeedbackListProps {
    feedback: {
        data: FeedbackData[];
        meta: any;
        links: any;
    };
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: Lightbox
// ----------------------------------------------------------------------
const Lightbox = ({ url, onClose }: { url: string; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90"
            >
                <X className="h-6 w-6" />
            </button>
            <img
                src={url}
                alt="Feedback attachment"
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Image Gallery
// ----------------------------------------------------------------------
const FeedbackImageGallery = ({ attachments }: { attachments: Attachment[] }) => {
    const images = attachments.filter((a) => a.mime_type.startsWith('image/'));
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (images.length === 0) return null;

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {images.map((img) => (
                <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className="group relative h-16 w-16 overflow-hidden rounded-xl border-2 border-slate-100 transition-all hover:border-primary active:scale-95"
                >
                    <img
                        src={img.url}
                        alt={img.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </button>
            ))}
            {selectedImage && <Lightbox url={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
};

// ----------------------------------------------------------------------
// SUB-COMPONENT: Star Rating
// ----------------------------------------------------------------------
const StarRating = ({ rating }: { rating: number | null }) => {
    if (rating === null) return null;

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-3 w-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`}
                />
            ))}
        </div>
    );
};

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
export default function FeedbackList({ feedback }: FeedbackListProps) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    
    const feedbackList = feedback.data || [];
    const meta = feedback.meta || {};

    return (
        <PublicLayout title="" description="">
            <Head title="Aking mga Feedback" />

            <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
                {/* Header Section */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 text-center sm:text-left">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Aking mga Feedback
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            Subaybayan ang iyong mga mungkahi at reklamo.
                        </p>
                    </div>
                    <Link href={`/${slug}/home`} className="hidden sm:block">
                        <button className="flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Bumalik sa Home
                        </button>
                    </Link>
                </div>

                {feedbackList.length === 0 ? (
                    <Card className="border-none bg-slate-50/50 shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <MessageSquare className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Wala pang nakatalang feedback</h3>
                            <p className="mt-2 max-w-xs text-sm font-medium text-slate-500 leading-relaxed">
                                Nais mo bang mag-abot ng mungkahi o reklamo? Ang iyong boses ay mahalaga sa amin.
                            </p>
                            <Link href={`/${slug}/give-feedback`} className="mt-6">
                                <Button className="h-12 rounded-xl bg-primary px-8 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
                                    Mag-abot ng Feedback
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {feedbackList.map((item) => (
                            <Card key={item.id} className="overflow-hidden border-2 border-slate-100 shadow-sm transition-all duration-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar / Icon */}
                                        <div className={`hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 sm:flex ${
                                            item.is_anonymous ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-primary/10 bg-primary/5 text-primary'
                                        }`}>
                                            {item.is_anonymous ? <VenetianMask className="h-6 w-6" /> : <User className="h-6 w-6" />}
                                        </div>

                                        <div className="min-w-0 flex-1 space-y-4">
                                            {/* Header */}
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary/80">
                                                        {item.subject || 'Feedback'}
                                                    </h4>
                                                    <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                        <Calendar className="h-3 w-3" />
                                                        {item.created_at}
                                                    </p>
                                                </div>
                                                <StarRating rating={item.rating} />
                                            </div>

                                            {/* Message */}
                                            <div className="relative rounded-2xl bg-slate-50 p-4">
                                                <MessageSquareQuote className="absolute top-3 left-3 h-4 w-4 text-primary/10" />
                                                <p className="relative z-10 text-sm font-medium leading-relaxed text-slate-700 italic">
                                                    "{item.message}"
                                                </p>
                                            </div>

                                            {/* Gallery */}
                                            <FeedbackImageGallery attachments={item.attachments} />

                                            {/* Footer / Meta */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4">
                                                {item.department && (
                                                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/50 px-2 py-1">
                                                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase">
                                                            {item.department.name}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    Isinumite ni: <b className="text-slate-600">{item.is_anonymous ? 'Anonymous' : item.citizen_name}</b>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination Section */}
                        {meta.links && meta.last_page > 1 && (
                            <div className="mt-10 space-y-4">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {meta.links.map((link: any, idx: number) => {
                                        const label = link.label
                                            .replace('&laquo;', '‹')
                                            .replace('&raquo;', '›')
                                            .replace('Previous', '')
                                            .replace('Next', '');
                                        
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-slate-50 px-3 text-xs font-bold text-slate-300"
                                                    dangerouslySetInnerHTML={{ __html: label }}
                                                />
                                            );
                                        }
                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-xs font-bold transition-all ${
                                                    link.active
                                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-primary/30 hover:text-primary'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Ipinapakita ang {meta.from} hanggang {meta.to} ng {meta.total} feedback
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Bottom Action */}
                <div className="mt-8 flex justify-center sm:hidden">
                    <Link href={`/${slug}/home`}>
                        <button className="flex items-center text-sm font-bold text-slate-400 hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Bumalik sa Home
                        </button>
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}

// Add simple Button helper since it's used in empty state
const Button = ({ children, className, ...props }: any) => (
    <button className={`inline-flex items-center justify-center transition-all active:scale-95 ${className}`} {...props}>
        {children}
    </button>
);

