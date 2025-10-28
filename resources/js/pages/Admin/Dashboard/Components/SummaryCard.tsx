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
            {stats.map((item) => (
                <Card key={item.title} className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {item.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.count}</div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {item.count > 0
                                ? `${item.count} total requests`
                                : 'No requests yet'}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
