'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionCenterApi } from '@/Core/Api/ActionCenter/AssistanceRequestApi';
import { useQuery } from '@tanstack/react-query';
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';

export function SummaryCards() {
    const { data, isLoading, error } = useQuery<{ request: AssistanceRequest[] }>({
        queryKey: ['request-list'],
        queryFn: ActionCenterApi.getAllRequest,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error || !data) {
        return <div>Error loading data.</div>;
    }

    const countByType = (type: string) =>
        data.request.filter((r) => r.assistance_type?.toLowerCase() === type.toLowerCase()).length;

    const stats = [
        { title: 'Food Assistance', count: countByType('Food Assistance') },
        { title: 'Medical Assistance', count: countByType('Medical Assistance') },
        { title: 'Financial Assistance', count: countByType('Financial Assistance') },
        { title: 'Burial Assistance', count: countByType('Burial Assistance') },
        { title: 'Transportation Assistance', count: countByType('Transportation Assistance') },
        { title: 'Community Resources', count: countByType('Community Resources') },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card key="total_disbursement" className="bg-gradient-to-br from-emerald-50 to-teal-100 shadow-md border-none rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-emerald-800">
                        Total Disbursement
                    </CardTitle>
                    <div className="p-2 bg-emerald-100 rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-emerald-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .843-3 2s1.343 2 3 2 3 .843 3 2-1.343 2-3 2m0-8V4m0 12v4"
                            />
                        </svg>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-extrabold text-emerald-900">₱100,000.00</div>
                </CardContent>
            </Card>


            {stats.map((item) => (
                <Card
                    key={item.title}
                    className="bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow border border-gray-100 rounded-2xl"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-600">
                            {item.title}
                        </CardTitle>

                        {/* Optional dynamic icon per card (can be customized) */}
                        <div className="p-2 bg-gray-100 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M12 18h.01M12 6h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                                />
                            </svg>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="text-3xl font-extrabold text-gray-900">{item.count}</div>

                        {item.count > 0 ? (
                            <p className="mt-1 text-xs text-emerald-700 font-medium">
                                ₱15,000 total disbursement
                            </p>
                        ) : (
                            <p className="mt-1 text-xs text-muted-foreground">No requests yet</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
