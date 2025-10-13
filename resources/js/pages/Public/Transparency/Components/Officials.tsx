import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Users } from 'lucide-react';

const officials = [
    {
        name: 'Hon. [Mayor Name]',
        position: 'Municipal Mayor',
        email: 'mayor@municipality.gov.ph',
        phone: '+63 XXX XXX XXXX',
    },
    {
        name: 'Hon. [Vice Mayor Name]',
        position: 'Vice Mayor',
        email: 'vicemayor@municipality.gov.ph',
        phone: '+63 XXX XXX XXXX',
    },
    {
        name: '[Name]',
        position: 'Municipal Administrator',
        email: 'admin@municipality.gov.ph',
        phone: '+63 XXX XXX XXXX',
    },
    {
        name: '[Name]',
        position: 'Municipal Treasurer',
        email: 'treasurer@municipality.gov.ph',
        phone: '+63 XXX XXX XXXX',
    },
    {
        name: '[Name]',
        position: 'Municipal Accountant',
        email: 'accountant@municipality.gov.ph',
        phone: '+63 XXX XXX XXXX',
    },
    {
        name: '[Name]',
        position: 'Municipal Planning & Development Officer',
        email: 'mpdo@municipality.gov.ph',
        phone: '+63 XXX XXX XXXX',
    },
];

export function Officials() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-primary" />
                    Elected Officials & Key Department Heads
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {officials.map((official, index) => (
                        <div key={index} className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                            <h3 className="font-semibold text-foreground">{official.name}</h3>
                            <p className="text-sm text-muted-foreground">{official.position}</p>
                            <div className="space-y-1 pt-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{official.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <span>{official.phone}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
