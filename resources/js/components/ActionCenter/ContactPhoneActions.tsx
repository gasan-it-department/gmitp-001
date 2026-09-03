import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, Copy, MessageSquareText, PhoneCall } from 'lucide-react';
import { useState } from 'react';

interface ContactPhoneActionsProps {
    phone: string | null | undefined;
    className?: string;
}

export function ContactPhoneActions({ phone, className }: ContactPhoneActionsProps) {
    const [copied, setCopied] = useState(false);
    const displayPhone = phone?.trim();

    if (!displayPhone) {
        return <p className={cn('text-sm text-slate-500', className)}>No contact phone encoded</p>;
    }

    const phoneUri = normalizePhoneForUri(displayPhone);

    const copyPhone = async () => {
        try {
            await navigator.clipboard.writeText(displayPhone);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}>
            <a href={`tel:${phoneUri}`} className="min-w-0 text-sm font-medium break-all text-slate-800 hover:underline">
                {displayPhone}
            </a>

            <TooltipProvider delayDuration={150}>
                <div className="flex items-center gap-1.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild size="icon" variant="outline" className="h-11 w-11" aria-label={`Call ${displayPhone}`}>
                                <a href={`tel:${phoneUri}`}>
                                    <PhoneCall />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Call</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild size="icon" variant="outline" className="h-11 w-11" aria-label={`Text ${displayPhone}`}>
                                <a href={`sms:${phoneUri}`}>
                                    <MessageSquareText />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Text</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-11 w-11"
                                aria-label={`Copy ${displayPhone}`}
                                onClick={copyPhone}
                            >
                                {copied ? <Check className="text-emerald-600" /> : <Copy />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{copied ? 'Copied' : 'Copy number'}</TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </div>
    );
}

function normalizePhoneForUri(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    return phone.startsWith('+') || digits.startsWith('63') ? `+${digits}` : digits;
}
