import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Download } from 'lucide-react';

const services = [
    {
        name: 'Business Permit Application',
        office: 'Business Permits & Licensing Office',
        time: '3-5 working days',
        fee: '₱500 - ₱5,000',
    },
    { name: 'Community Tax Certificate', office: "Municipal Treasurer's Office", time: '15 minutes', fee: '₱5 - ₱500' },
    {
        name: 'Building Permit Application',
        office: 'Office of the Building Official',
        time: '7-14 working days',
        fee: 'Varies',
    },
    { name: 'Civil Registry Documents', office: 'Civil Registry Office', time: '30 minutes - 1 day', fee: '₱150 - ₱300' },
];

export function CitizensCharter() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Citizen's Charter
                </CardTitle>
                <CardDescription>Guide to our services, requirements, and processing times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                        <p className="mb-3 text-sm leading-relaxed text-foreground">
                            Our Citizen's Charter outlines all services provided by the municipality, including requirements, fees, processing times,
                            and the persons responsible for each service.
                        </p>
                        <Button size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Complete Citizen's Charter (PDF)
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Key Services</h3>
                    {services.map((service, index) => (
                        <div key={index} className="space-y-2 rounded-lg border border-border p-3">
                            <h4 className="font-medium text-foreground">{service.name}</h4>
                            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                                <div>
                                    <span className="font-medium text-foreground">Office:</span> {service.office}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-medium text-foreground">Time:</span> {service.time}
                                </div>
                                <div>
                                    <span className="font-medium text-foreground">Fee:</span> {service.fee}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
