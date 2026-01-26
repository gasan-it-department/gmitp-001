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
    isUppercase: boolean;
}

export const InertiaInput = ({
    label,
    id,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
    disabled = false,
    isUppercase = false,
}: InputProps) => {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label}
            </Label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    error ? 'border-red-500 focus-visible:ring-red-500' : 'border-input'
                } ${isUppercase ? 'uppercase placeholder:normal-case' : ''}`}
            />
            {error && <span className="animate-pulse text-sm text-red-500">{error}</span>}
        </div>
    );
};
