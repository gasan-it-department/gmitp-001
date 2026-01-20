import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    id: string;
    disabled?: boolean;
    error?: string;
}

export function PasswordInput({ value, onChange, placeholder, id, disabled, error }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="w-full">
            <div className="relative">
                <Input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`pr-10 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`} // Added red border on error
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}{' '}
        </div>
    );
}
