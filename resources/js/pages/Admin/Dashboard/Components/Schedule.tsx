import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User } from 'lucide-react';

const upcomingEvents = [
    {
        id: 1,
        title: 'Team Standup Meeting',
        date: '2024-01-15',
        time: '09:00 AM',
        type: 'Meeting',
        priority: 'High',
        attendees: 8,
    },
    {
        id: 2,
        title: 'Project Deadline Review',
        date: '2024-01-15',
        time: '02:00 PM',
        type: 'Deadline',
        priority: 'Critical',
        attendees: 5,
    },
    {
        id: 3,
        title: 'Client Presentation',
        date: '2024-01-16',
        time: '10:30 AM',
        type: 'Presentation',
        priority: 'High',
        attendees: 12,
    },
    {
        id: 4,
        title: 'Budget Planning Session',
        date: '2024-01-16',
        time: '03:00 PM',
        type: 'Planning',
        priority: 'Medium',
        attendees: 6,
    },
    {
        id: 5,
        title: 'Code Review Session',
        date: '2024-01-17',
        time: '11:00 AM',
        type: 'Review',
        priority: 'Medium',
        attendees: 4,
    },
];

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'Critical':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'High':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export function AdminSchedule() {
    return (
        <Card className="border-border shadow-sm">
            <CardHeader>
                <CardTitle className="text-card-foreground">Upcoming Events & Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex-1">
                                <h4 className="font-medium text-card-foreground">{event.title}</h4>
                                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <User className="h-4 w-4" />
                                        <span>{event.attendees} attendees</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="text-xs">
                                    {event.type}
                                </Badge>
                                <Badge className={`text-xs ${getPriorityColor(event.priority)}`}>{event.priority}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
