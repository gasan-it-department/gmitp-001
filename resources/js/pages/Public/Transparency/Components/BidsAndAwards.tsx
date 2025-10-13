import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, ExternalLink, FileText, Gavel } from 'lucide-react';

const bids = [
    {
        title: 'Construction of Municipal Health Center',
        type: 'Infrastructure',
        status: 'Open',
        deadline: '2025-02-15',
        budget: '₱5,000,000',
    },
    {
        title: 'Supply and Delivery of Office Equipment',
        type: 'Goods',
        status: 'Awarded',
        deadline: '2025-01-20',
        budget: '₱850,000',
    },
    {
        title: 'Road Rehabilitation Project - Barangay Roads',
        type: 'Infrastructure',
        status: 'Evaluation',
        deadline: '2025-01-30',
        budget: '₱3,200,000',
    },
];

export function BidsAndAwards() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Gavel className="h-5 w-5 text-primary" />
                    Bids & Awards
                </CardTitle>
                <CardDescription>Latest procurement opportunities and awarded contracts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    {bids.map((bid, index) => (
                        <div key={index} className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="mb-1 font-semibold text-foreground">{bid.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span>{bid.type}</span>
                                        <span>•</span>
                                        <span>Budget: {bid.budget}</span>
                                        <span>•</span>
                                        <span>Deadline: {bid.deadline}</span>
                                    </div>
                                </div>
                                <Badge variant={bid.status === 'Open' ? 'default' : bid.status === 'Awarded' ? 'secondary' : 'outline'}>
                                    {bid.status}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                                    <FileText className="h-3 w-3" />
                                    View Details
                                </Button>
                                {bid.status === 'Awarded' && (
                                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                                        <Award className="h-3 w-3" />
                                        Notice of Award
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-border pt-4">
                    <Button variant="outline" className="w-full gap-2 bg-transparent sm:w-auto">
                        <ExternalLink className="h-4 w-4" />
                        View All Bids on PhilGEPS
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
