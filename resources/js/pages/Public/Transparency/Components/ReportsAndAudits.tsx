import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileCheck, TrendingUp } from 'lucide-react';

const reports = [
    { name: 'COA Annual Audit Report 2024', type: 'Audit', year: '2024', status: 'Latest' },
    { name: 'Performance Targets & Accomplishments 2024', type: 'Performance', year: '2024', status: 'Latest' },
    { name: 'COA Annual Audit Report 2023', type: 'Audit', year: '2023', status: 'Posted' },
    { name: 'Gender and Development (GAD) Report 2024', type: 'GAD', year: '2024', status: 'Latest' },
    { name: 'DRRM Fund Utilization Report 2024', type: 'DRRM', year: '2024', status: 'Latest' },
];

export function ReportsAndAudits() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Audit Reports & Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {reports.map((report, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex flex-1 items-center gap-3">
                                {report.type === 'Performance' ? (
                                    <TrendingUp className="h-4 w-4 flex-shrink-0 text-secondary" />
                                ) : (
                                    <FileCheck className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground">{report.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {report.type} Report • {report.year}
                                    </p>
                                </div>
                                {report.status === 'Latest' && (
                                    <Badge variant="default" className="flex-shrink-0">
                                        Latest
                                    </Badge>
                                )}
                            </div>
                            <Button size="sm" variant="ghost" className="ml-2 flex-shrink-0">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download {report.name}</span>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
