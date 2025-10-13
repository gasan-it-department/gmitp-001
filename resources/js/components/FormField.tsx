import { cn } from '@/lib/utils';
import { FieldError, useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface InputFormProps {
    label?: string;
    name: string;
    type?: string;
    required?: boolean;
    className?: string;
    autoComplete?: string;
}

export function FormInput({ name, label, type, required = false, className, autoComplete }: InputFormProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const fieldError = (errors[name] as FieldError)?.message;
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-md font-bold text-gray-700">
                {label} {required && '*'}
            </Label>

            <Input
                id={name}
                type={type}
                autoComplete={autoComplete}
                {...register(name, { required: `${label} is required` })}
                className={cn(
                    'rounded-md border transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200',
                    fieldError ? 'border-red-500' : 'border-gray-300',
                    className,
                )}
                aria-label={label}
                aria-required={required}
                aria-invalid={!!fieldError}
            />
            {fieldError && (
                <p className="text-sm text-red-600" role="alert">
                    {fieldError}
                </p>
            )}
        </div>
    );
}
