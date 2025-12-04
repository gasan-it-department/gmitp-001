import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Beneficiary } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function BeneficiaryCard({ beneficiary }: { beneficiary?: Beneficiary }) {
    if (!beneficiary) return null;

    const initials = beneficiary.first_name[0] + beneficiary.last_name[0];

    return (
        <Card className="h-full border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold">Beneficiary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 border-2 border-gray-100">
                        <AvatarFallback className="bg-blue-50 text-xl font-bold text-blue-600">{initials}</AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">{beneficiary.name}</h3>
                    <p className="text-sm text-gray-500">Citizen</p>
                </div>
                <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-3">
                        <Phone className="mt-1 h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Contact</p>
                            <p className="text-sm text-gray-900">{beneficiary.contact_number}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="mt-1 h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Email</p>
                            <p className="text-sm text-gray-900">{beneficiary.email || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="mt-1 h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Address</p>
                            <p className="text-sm text-gray-900">
                                {beneficiary.barangay}, {beneficiary.municipality}
                            </p>
                            <p className="text-xs text-gray-500">{beneficiary.province}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
