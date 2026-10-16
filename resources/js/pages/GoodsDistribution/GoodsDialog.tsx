import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Portal } from '@headlessui/react';
import { useRef, type ComponentProps } from 'react';
import './responsive.css';

export function GoodsDialogContent({ className, ...props }: ComponentProps<typeof DialogContent>) {
    const portalTarget = useRef<HTMLDivElement>(null);

    // Keep anchored pickers inside Radix's modal interaction boundary.
    return <Portal.Group target={portalTarget}>
        <DialogContent ref={portalTarget} className={cn('goods-dialog @container/goods-dialog min-w-0 overflow-y-auto', className)} {...props} />
    </Portal.Group>;
}
