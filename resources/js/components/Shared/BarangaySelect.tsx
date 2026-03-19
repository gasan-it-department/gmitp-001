import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PsgcBarangay } from '@/Core/Types/Psgc/psgc';
import psgc from '@/routes/psgc';
import { useEffect, useState } from 'react';

interface BarangaySelectProps {
    municipalityId: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function BarangaySelect({ municipalityId, value, onChange, disabled }: BarangaySelectProps) {
    const [barangays, setBarangays] = useState<PsgcBarangay[]>([]);

    useEffect(() => {
        if (!municipalityId) {
            setBarangays([]);
            return;
        }

        fetch(psgc.barangays.url(municipalityId))
            .then((res) => res.json())
            .then(setBarangays);
    }, [municipalityId]);

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Barangay</label>
            <Select disabled={disabled || !municipalityId} value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Barangay..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                    {barangays.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                            {b.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
