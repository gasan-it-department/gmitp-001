import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FeedbackData } from '@/Core/Types/Feedback/FeedbackTypes';
import AdminLayout from '@/layouts/App/AppLayout';
import { ArrowLeft, Download, Eye, FileText, UserCheck, UserX } from 'lucide-react';
import { FeedbackMetaCard } from './Components/FeedbackMetaCard';
import { StarRating } from './Components/StarRating';

interface Props {
    feedback: FeedbackData;
}

export default function FeedbackDetails({ feedback }: Props) {
    // Helper: Determine Sentiment Color
    const getSentimentColor = (rating?: number) => {
        if (!rating) return 'bg-gray-100 text-gray-600';
        if (rating >= 4) return 'bg-green-50 text-green-700 border-green-200';
        if (rating === 3) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        return 'bg-red-50 text-red-700 border-red-200';
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                {/* --- HEADER --- */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <button
                            onClick={() => window.history.back()}
                            className="mb-2 flex items-center text-sm text-gray-500 transition-colors hover:text-gray-900"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Feedbacks
                        </button>
                        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900">
                            Feedback Details
                            <Badge variant="outline" className="font-mono text-xs font-normal text-gray-500">
                                #{feedback.id}
                            </Badge>
                        </h1>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-500">Submitted on</p>
                        <p className="font-medium text-gray-900">
                            {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN (Core Content) */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* 1. REVIEW SUMMARY CARD */}
                        <Card>
                            <CardHeader className="bg-gray-50/50 pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-gray-500">Feedback Target</p>
                                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                            {feedback.feedback_target}
                                            {feedback.employee_name && (
                                                <span className="text-base font-normal text-gray-400">/ {feedback.employee_name}</span>
                                            )}
                                        </h2>
                                    </div>
                                    <div
                                        className={`flex flex-col items-center justify-center rounded-lg border px-4 py-2 ${getSentimentColor(feedback.rating)}`}
                                    >
                                        <StarRating rating={feedback.rating} />
                                        <span className="mt-1 text-xs font-bold tracking-wide uppercase">
                                            {feedback.rating ? `${feedback.rating} / 5 Rating` : 'No Rating'}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6">
                                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    Citizen's Message
                                </h3>
                                <div className="min-h-[100px] rounded-lg border border-gray-100 bg-gray-50 p-4">
                                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                                        {feedback.message || <span className="text-gray-400 italic">No written message provided.</span>}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. ATTACHMENTS (Reuse Logic) */}
                        {feedback.attachments && feedback.attachments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Evidence / Attachments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        {feedback.attachments.map((file) => (
                                            <div key={file.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
                                                {file.type.startsWith('image') ? (
                                                    <img src={file.view_url} alt={file.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                                                        <FileText className="mb-2 h-8 w-8" />
                                                        <span className="w-full truncate px-2 text-center text-xs">{file.name}</span>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <a
                                                        href={file.view_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-full bg-white p-2 text-gray-900 hover:bg-gray-200"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                    <a href={file.download_url} className="rounded-full bg-white p-2 text-gray-900 hover:bg-gray-200">
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Meta Data) */}
                    <div className="space-y-6">
                        {/* 1. SENDER INFO */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xs font-bold tracking-wider text-gray-500 uppercase">Submitted By</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex items-center gap-3">
                                    <div
                                        className={`rounded-full p-3 ${feedback.is_anonymous ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}
                                    >
                                        {feedback.is_anonymous ? <UserX className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">
                                            {feedback.is_anonymous ? 'Anonymous Citizen' : feedback.sender_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {feedback.is_anonymous ? 'Identity hidden by request' : 'Verified Identity'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. TECHNICAL INFO (Using Child Component) */}
                        <FeedbackMetaCard ip={feedback.ip_address} userAgent={feedback.user_agent} />

                        {/* 3. ACTIONS (Admin Control) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xs font-bold tracking-wider text-gray-500 uppercase">Admin Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" variant="outline">
                                    Print Feedback
                                </Button>
                                <Button className="w-full border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
                                    Archive / Hide
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
