// components/FormInputField.tsx
import { Label } from '@/components/ui/label';

interface InputProps {
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    isUppercase?: boolean;
    placeholder?: string;
    /** Optional numeric-input attributes (used when type="number"). */
    min?: number | string;
    max?: number | string;
    step?: number | string;
}

export const FormInput = ({
    label,
    id,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
    disabled = false,
    isUppercase = false, // Default is false, so it works if prop is missing
    placeholder, // 3. Destructure it
    min,
    max,
    step,
}: InputProps) => {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                // Stop the mouse wheel from silently changing a focused number
                // input (e.g. scrolling the page nudged 9000 → 8999.98 by step).
                onWheel={type === 'number' ? (e) => e.currentTarget.blur() : undefined}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    error ? 'border-red-500 focus-visible:ring-red-500' : 'border-input'
                } ${isUppercase ? 'uppercase placeholder:normal-case' : ''}`}
            />
            {error && <span className="animate-pulse text-sm text-red-500">{error}</span>}
        </div>
    );
};
