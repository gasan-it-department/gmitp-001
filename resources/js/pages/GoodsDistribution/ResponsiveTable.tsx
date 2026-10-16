import { cn } from '@/lib/utils';
import { useEffect, useRef, type ComponentProps } from 'react';

export default function ResponsiveTable({ children, className, ...props }: ComponentProps<'table'>) {
    const ref = useRef<HTMLTableElement>(null);
    useEffect(() => {
        const table = ref.current;
        if (!table) return;
        const labels = Array.from(table.querySelectorAll('thead th'), (cell) => cell.textContent?.trim() ?? '');
        for (const row of Array.from(table.tBodies[0]?.rows ?? [])) {
            for (const [index, cell] of Array.from(row.cells).entries()) {
                if (cell.colSpan === 1 && labels[index]) cell.dataset.label = labels[index];
            }
        }
    }, [children]);
    return (
        <table ref={ref} className={cn('goods-responsive-table', className)} {...props}>
            {children}
        </table>
    );
}
