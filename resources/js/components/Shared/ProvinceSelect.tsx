import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PsgcProvince } from '@/Core/Types/Psgc/psgc';
import psgc from '@/routes/psgc';
import { useEffect, useState } from 'react';
interface ProvinceSelectProps {
    regionId: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    onBypassCheck?: (hasNoProvinces: boolean) => void;
}

export function ProvinceSelect({ regionId, value, onChange, onBypassCheck, disabled }: ProvinceSelectProps) {
    const [provinces, setProvinces] = useState<PsgcProvince[]>([]);
    const [isbypassed, setIsBypassed] = useState(false);

    useEffect(() => {
        if (!regionId) {
            setProvinces([]);
            return;
        }

        fetch(psgc.provinces.url(regionId))
            .then((res) => res.json())
            .then((data) => {
                setProvinces(data);
                const bypass = data.length === 0;
                setIsBypassed(bypass);
                if (onBypassCheck) onBypassCheck(bypass);
            });
    }, [regionId, onBypassCheck]);

    if (isbypassed) {
        return (
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Province</label>
                <Select disabled value="n/a">
                    <SelectTrigger className="bg-gray-50 text-gray-500">
                        <SelectValue placeholder="Not Applicable (Independent Cities)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="n/a">Not Applicable</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Province</label>
            <Select disabled={disabled || !regionId} value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Province..." />
                </SelectTrigger>
                <SelectContent>
                    {provinces.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
