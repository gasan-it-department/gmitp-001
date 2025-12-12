import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar } from 'lucide-react';

const notices = [
    {
        title: 'Public Consultation: Annual Investment Plan 2026',
        date: '2025-02-20',
        type: 'Consultation',
        description: 'All stakeholders are invited to participate in the formulation of the 2026 Annual Investment Plan.',
    },
    {
        title: 'Municipal Ordinance No. 2025-01: Waste Segregation',
        date: '2025-01-15',
        type: 'Ordinance',
        description: 'New ordinance on mandatory waste segregation at source, effective March 1, 2025.',
    },
    {
        title: 'Advisory: Tax Payment Deadline Extension',
        date: '2025-01-10',
        type: 'Advisory',
        description: 'Real Property Tax payment deadline extended to March 31, 2025 without penalties.',
    },
];

export function PublicNotices() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Bell className="h-5 w-5 text-primary" />
                    Public Notices & Advisories
                </CardTitle>
                <CardDescription>Latest announcements, ordinances, and public consultations</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {notices.map((notice, index) => (
                        <div key={index} className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="flex-1 font-semibold text-foreground">{notice.title}</h3>
                                <Badge variant="outline">{notice.type}</Badge>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">{notice.description}</p>
                            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Posted: {notice.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
