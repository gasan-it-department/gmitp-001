import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Download, Briefcase, Tag, DollarSign } from 'lucide-react';

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
    // --- THEME COLORS ---
    const primaryGradient = 'bg-gradient-to-r from-red-500 to-orange-500';
    const primaryTextColor = 'text-red-700 dark:text-orange-200';
    const accentTextColor = 'text-orange-800 dark:text-orange-300';
    // --------------------

    return (
        <Card className="rounded-2xl shadow-xl border-red-200/60 dark:border-red-900/40">
            <CardHeader className="border-b border-orange-200 dark:border-red-900">
                <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-red-800 dark:text-orange-100">
                    {/* Icon with gradient background */}
                    <div className={`p-2 rounded-xl ${primaryGradient} text-white shadow-md flex-shrink-0`}>
                        <BookOpen className="h-6 w-6" />
                    </div>
                    Citizen's Charter
                </CardTitle>
                <CardDescription className="text-sm text-orange-800/90 dark:text-orange-200/90">Guide to our services, requirements, and processing times for the municipality.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">

                {/* DOWNLOAD BANNER (Themed and Prominent) */}
                {/* <div
                    className={`
                        flex flex-col md:flex-row gap-4 rounded-xl p-5 border 
                        // Warm Gradient Background
                        bg-gradient-to-r from-red-50/70 via-orange-50/70 to-amber-100/70
                        dark:from-red-950/70 dark:via-orange-950/70 dark:to-amber-900/70
                        border-red-200/60 dark:border-red-900/40
                    `}
                >
                    <BookOpen className="h-8 w-8 flex-shrink-0 text-red-600 dark:text-orange-400" />
                    <div className="flex-1">
                        <p className={`mb-3 text-sm leading-relaxed ${accentTextColor}`}>
                            Our Citizen's Charter outlines all services provided by the municipality, including requirements, fees, processing times,
                            and the persons responsible for each service.
                        </p>
                        <Button
                            size="sm"
                            className={`gap-2 ${primaryGradient} text-white shadow-md hover:from-red-600 hover:to-orange-600`}
                        >
                            <Download className="h-4 w-4" />
                            Download Complete Charter (PDF)
                        </Button>
                    </div>
                </div> */}

                <div className="space-y-4">
                    <h3 className={`font-extrabold text-xl ${primaryTextColor}`}>Key Services</h3>

                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="space-y-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 transition-all duration-200 hover:shadow-lg"
                        >
                            <h4 className="font-bold text-base text-gray-900 dark:text-gray-100">{service.name}</h4>

                            {/* Service Details Grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">

                                {/* Office */}
                                <div className="flex flex-col">
                                    <span className={`font-semibold text-xs ${primaryTextColor} uppercase`}>Office</span>
                                    <span className="text-gray-700 dark:text-gray-300">{service.office}</span>
                                </div>

                                {/* Time */}
                                <div className="flex flex-col">
                                    <span className={`font-semibold text-xs ${primaryTextColor} uppercase`}>Time</span>
                                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                        <Clock className="h-4 w-4 flex-shrink-0 text-red-500 dark:text-orange-400" />
                                        {service.time}
                                    </div>
                                </div>

                                {/* Fee */}
                                <div className="flex flex-col">
                                    <span className={`font-semibold text-xs ${primaryTextColor} uppercase`}>Fee</span>
                                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                        <Tag className="h-4 w-4 flex-shrink-0 text-red-500 dark:text-orange-400" />
                                        <span className="font-bold">{service.fee}</span>
                                    </div>
                                </div>

                            </div>

                            {/* Action Button (Optional Detail Link per service) */}
                            <div className="pt-2">
                                <Button size="sm" variant="outline" className={`gap-2 bg-white dark:bg-neutral-900 border-red-500 ${primaryTextColor} hover:bg-red-50/50`}>
                                    <Briefcase className="h-4 w-4" />
                                    View Requirements (PDF)
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}