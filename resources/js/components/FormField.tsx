// components/ui/form-field.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import * as React from 'react';

interface FormFieldProps {
    id: string;
    label: string;
    as?: 'input' | 'textarea';
    type?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    placeholder?: string;
    required?: boolean;
    error?: string;
    children?: React.ReactNode;
    className?: string;
}

export function FormField({
    id,
    label,
    as = 'input',
    type = 'text',
    value,
    onChange,
    placeholder,
    required,
    error,
    children,
    className = '',
}: FormFieldProps) {
    // Choose which input component to render
    const FieldComponent = as === 'textarea' ? Textarea : Input;

    return (
        <div className={`flex flex-col space-y-2 ${className}`}>
            <Label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </Label>

            {/* If children is provided, render that instead */}
            {children ? (
                children
            ) : (
                <FieldComponent
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="focus:ring-2 focus:ring-green-500"
                />
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
