import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PsgcMunicipality } from '@/Core/Types/Psgc/psgc';
import psgc from '@/routes/psgc';
import { useEffect, useState } from 'react';
interface MunicipalitySelectProps {
    provinceId: string;
    regionId?: string;
    isBypassed?: boolean;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function MunicipalitySelect({ provinceId, regionId, isBypassed, value, onChange, disabled }: MunicipalitySelectProps) {
    const [municipalities, setMunicipalities] = useState<PsgcMunicipality[]>([]);
    useEffect(() => {
        // If bypassing province, fetch by Region ID (NCR cities)
        if (isBypassed && regionId) {
            fetch(psgc.cities.url(regionId))
                .then((res) => res.json())
                .then(setMunicipalities);
            return;
        }

        if (provinceId) {
            fetch(psgc.municipalities.url(provinceId))
                .then((res) => res.json())
                .then(setMunicipalities);
        } else {
            setMunicipalities([]);
        }
    }, [provinceId, regionId, isBypassed]);
    const isDisabled = disabled || (!isBypassed && !provinceId) || (isBypassed && !regionId);
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">City / Municipality</label>
            <Select disabled={isDisabled} value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select City/Municipality..." />
                </SelectTrigger>
                <SelectContent>
                    {municipalities.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                            {m.name} {m.is_city ? '(City)' : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
