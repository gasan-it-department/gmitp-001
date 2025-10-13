import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Briefcase, DollarSign, MapPin } from 'lucide-react';

const projects = [
    {
        name: 'Municipal Road Network Improvement',
        location: 'Various Barangays',
        budget: '₱15,000,000',
        status: 'Ongoing',
        progress: 65,
        image: 'assets/road.jpg',
    },
    {
        name: 'Community Health Center Expansion',
        location: 'Barangay Centro',
        budget: '₱8,500,000',
        status: 'Planning',
        progress: 20,
        image: 'assets/rhu-dev.jpg',
    },
    {
        name: 'Livelihood Training Program',
        location: 'All Barangays',
        budget: '₱2,000,000',
        status: 'Ongoing',
        progress: 80,
        image: 'assets/maxresdefault.jpg',
    },
];

export function ProgramsAndProjects() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Programs, Projects & Activities
                </CardTitle>
                <CardDescription>Current and planned initiatives for community development</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                        <div key={index} className="overflow-hidden rounded-lg border border-border bg-card">
                            <img src={project.image || '/placeholder.svg'} alt={project.name} className="h-40 w-full object-cover" />
                            <div className="space-y-3 p-4">
                                <div>
                                    <h3 className="mb-2 font-semibold text-foreground">{project.name}</h3>
                                    <div className="space-y-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3" />
                                            <span>{project.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-3 w-3" />
                                            <span>Budget: {project.budget}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Progress</span>
                                        <Badge variant={project.status === 'Ongoing' ? 'default' : 'secondary'} className="text-xs">
                                            {project.status}
                                        </Badge>
                                    </div>
                                    <Progress value={project.progress} className="h-2" />
                                    <p className="text-right text-xs text-muted-foreground">{project.progress}% Complete</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
