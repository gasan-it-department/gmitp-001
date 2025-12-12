import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Info, MessageSquare } from 'lucide-react';

export function FeedbackSection() {
    return (
        <Card className="border-2 border-secondary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                    Feedback & Complaints
                </CardTitle>
                <CardDescription>Your voice matters. Help us improve our services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                    <div className="flex-1 space-y-3">
                        <p className="text-sm leading-relaxed text-foreground">
                            We welcome your feedback, suggestions, and complaints. Your input helps us deliver better services to our community. All
                            submissions are reviewed and addressed promptly.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                <MessageSquare className="h-4 w-4" />
                                Submit Feedback
                            </Button>
                            <Button variant="outline" className="gap-2 bg-transparent">
                                <ExternalLink className="h-4 w-4" />
                                Freedom of Information (FOI) Request
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
