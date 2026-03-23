import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PsgcRegion } from '@/Core/Types/Psgc/psgc';
import psgc from '@/routes/psgc';
import { useEffect, useState } from 'react';

interface RegionSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function RegionSelect({ value, onChange, disabled }: RegionSelectProps) {
    const [regions, setRegions] = useState<PsgcRegion[]>([]);

    useEffect(() => {
        fetch(psgc.regions.url())
            .then((res) => res.json())
            .then(setRegions);
    }, []);

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Region</label>
            <Select disabled={disabled} value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Region..." />
                </SelectTrigger>
                <SelectContent>
                    {regions.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                            {r.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
