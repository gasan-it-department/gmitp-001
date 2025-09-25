'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckSquare, DollarSign, TrendingDown, TrendingUp, Users } from 'lucide-react';

const summaryData = [
    {
        title: 'Total Users',
        value: '2,847',
        change: '+12.5%',
        trend: 'up',
        icon: Users,
        description: 'Active users this month',
    },
    {
        title: 'Revenue',
        value: '$45,231',
        change: '+8.2%',
        trend: 'up',
        icon: DollarSign,
        description: 'Total revenue this month',
    },
    {
        title: 'Activity',
        value: '12,543',
        change: '-2.1%',
        trend: 'down',
        icon: Activity,
        description: 'User interactions today',
    },
    {
        title: 'Tasks Completed',
        value: '89',
        change: '+15.3%',
        trend: 'up',
        icon: CheckSquare,
        description: 'Tasks finished this week',
    },
];

export function SummaryCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryData.map((item) => {
                const Icon = item.icon;
                const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown;

                return (
                    <Card key={item.title} className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendIcon className={`h-3 w-3 ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                                <span className={item.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{item.change}</span>
                                <span>from last month</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
