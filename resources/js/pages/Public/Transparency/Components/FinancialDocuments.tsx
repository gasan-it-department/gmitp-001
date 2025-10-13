import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, FileText } from 'lucide-react';

const documents = [
    {
        year: '2025',
        items: [
            { name: 'Annual Budget 2025', type: 'Budget', updated: '2025-01-15', status: 'Updated' },
            { name: 'Annual Procurement Plan (APP) 2025', type: 'Procurement', updated: '2025-01-10', status: 'Updated' },
            {
                name: 'Project Procurement Management Plan (PPMP) 2025',
                type: 'Procurement',
                updated: '2025-01-10',
                status: 'Updated',
            },
        ],
    },
    {
        year: '2024',
        items: [
            { name: 'Annual Budget 2024', type: 'Budget', updated: '2024-01-15', status: 'Posted' },
            { name: 'Supplemental Budget No. 1', type: 'Budget', updated: '2024-06-20', status: 'Posted' },
            { name: 'Annual Financial Report (AFR) 2024', type: 'Financial', updated: '2024-12-31', status: 'Posted' },
            {
                name: 'Statement of Receipts and Expenditures (SRE) 2024',
                type: 'Financial',
                updated: '2024-12-31',
                status: 'Posted',
            },
            { name: 'Annual Procurement Plan (APP) 2024', type: 'Procurement', updated: '2024-01-10', status: 'Posted' },
        ],
    },
    {
        year: '2023',
        items: [
            { name: 'Annual Budget 2023', type: 'Budget', updated: '2023-01-15', status: 'Posted' },
            { name: 'Annual Financial Report (AFR) 2023', type: 'Financial', updated: '2023-12-31', status: 'Posted' },
            {
                name: 'Statement of Receipts and Expenditures (SRE) 2023',
                type: 'Financial',
                updated: '2023-12-31',
                status: 'Posted',
            },
        ],
    },
];

export function FinancialDocuments() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    Financial Documents & Reports
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="2025" className="w-full">
                    {documents.map((yearData) => (
                        <AccordionItem key={yearData.year} value={yearData.year}>
                            <AccordionTrigger className="text-base font-semibold">{yearData.year} Documents</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-2">
                                    {yearData.items.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex flex-1 items-center gap-3">
                                                <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {doc.type} • Updated: {doc.updated}
                                                    </p>
                                                </div>
                                                <Badge variant={doc.status === 'Updated' ? 'default' : 'secondary'} className="flex-shrink-0">
                                                    {doc.status === 'Updated' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                    {doc.status}
                                                </Badge>
                                            </div>
                                            <Button size="sm" variant="ghost" className="ml-2 flex-shrink-0">
                                                <Download className="h-4 w-4" />
                                                <span className="sr-only">Download {doc.name}</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
