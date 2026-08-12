import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PsgcBarangay } from '@/Core/Types/Psgc/psgc';
import psgc from '@/routes/psgc';
import { useEffect, useState } from 'react';

interface BarangaySelection {
    name: string;
    psgc_code: string;
}

const ANY = '__any__';

interface BarangaySelectProps {
    municipalityId: string;
    value: string;
    onChange: (selection: BarangaySelection) => void;
    disabled?: boolean;
    showLabel?: boolean;
    useNameAsValue?: boolean;
    includeAny?: boolean;
    error?: string;
    required?: boolean;
}

export function BarangaySelect({
    municipalityId,
    value,
    onChange,
    disabled,
    showLabel = true,
    useNameAsValue = false,
    includeAny = false,
    error,
    required = false,
}: BarangaySelectProps) {
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

    const displayValue = includeAny && !value ? ANY : value;

    return (
        <div className="space-y-1">
            {showLabel && (
                <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-600 uppercase">
                    Barangay
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <Select
                disabled={disabled || !municipalityId}
                value={displayValue}
                onValueChange={(val) => {
                    if (includeAny && val === ANY) {
                        onChange({ name: '', psgc_code: '' });
                        return;
                    }
                    const found = barangays.find((b) => (useNameAsValue ? b.name === val : b.psgc_code === val));
                    if (found) onChange({ name: found.name, psgc_code: found.psgc_code });
                }}
            >
                <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Barangay..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                    {includeAny && <SelectItem value={ANY}>Any Barangay</SelectItem>}
                    {barangays.map((b) => (
                        <SelectItem key={b.id} value={useNameAsValue ? b.name : b.psgc_code}>
                            {b.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
        </div>
    );
}
