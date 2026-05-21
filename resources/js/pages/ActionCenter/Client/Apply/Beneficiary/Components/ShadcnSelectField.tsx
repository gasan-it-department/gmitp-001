import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Thin wrapper around shadcn's <Select> that adds a label, required
 * indicator, error display, and a consistent visual style (height,
 * focus ring color matching the MSWD brand blue).
 *
 * Currently scoped to the profile setup wizard's sections, but generic
 * enough to be promoted to `@/components/Shared/` once a second module
 * (e.g. the household-member entry form) needs it.
 */

interface ShadcnSelectFieldProps {
    label: string;
    id: string;
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export function ShadcnSelectField({
    label,
    id,
    value,
    onValueChange,
    options,
    placeholder = 'Select...',
    error,
    required = false,
    disabled = false,
}: ShadcnSelectFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={onValueChange} disabled={disabled} required={required}>
                <SelectTrigger
                    id={id}
                    className={`h-10 w-full bg-white ${error ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-[#005088]/30'}`}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <span className="animate-pulse text-sm text-red-500">{error}</span>}
        </div>
    );
}
