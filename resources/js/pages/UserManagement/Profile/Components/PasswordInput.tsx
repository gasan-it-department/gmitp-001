import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export function PasswordInput({ className, error, ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="group">
            {/* 1. We create a dedicated wrapper for the Input + Icon. 
               This ensures 'top-1/2' is always calculated relative to the Input's height only.
            */}
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn(
                        "pr-10", 
                        error && "border-red-500 focus-visible:ring-red-500 bg-red-50/50",
                        className
                    )}
                    {...props}
                />
                
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                    </span>
                </button>
            </div>

            {/* 2. The Error message is now OUTSIDE the 'relative' container.
               Its presence won't affect the centering of the eye icon.
            */}
            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1 flex items-center gap-1">
                    {error}
                </p>
            )}
            
            {/* Optional: Hide native browser password toggles (Edge/IE) to prevent double icons */}
            <style>{`
                input::-ms-reveal,
                input::-ms-clear {
                    display: none;
                }
            `}</style>
        </div>
    );
}