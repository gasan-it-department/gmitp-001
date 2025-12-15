import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Monitor } from 'lucide-react';

interface Props {
    ip?: string;
    userAgent?: string;
}

export function FeedbackMetaCard({ ip, userAgent }: Props) {
    return (
        <Card className="border-gray-200 bg-gray-50">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold tracking-wider text-gray-500 uppercase">Technical Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                    <Globe className="mt-0.5 h-4 w-4 text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500">IP Address</p>
                        <p className="font-mono text-gray-700">{ip || 'Unknown'}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Monitor className="mt-0.5 h-4 w-4 text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500">Device / User Agent</p>
                        <p className="font-mono text-xs leading-tight break-all text-gray-600">{userAgent || 'Unknown'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
