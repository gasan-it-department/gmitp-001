import { cn } from '@/lib/utils'; // Assuming you have a utility for tailwind classes
import { Link } from '@inertiajs/react';

interface Props {
    // Default to an empty array to avoid undefined crashes
    links?: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export function Pagination({ links = [] }: Props) {
    // 1. If there are no links, or only one page (Prev, 1, Next), don't show anything.
    if (links === undefined) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Pagination component received undefined links. Check your Resource or Controller.');
        }
        return null;
    }

    if (links.length <= 3) return null;

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1 py-6">
            {links.map((link, index) => {
                // Clean the labels
                const label = link.label.replace('&laquo; Previous', 'Previous').replace('Next &raquo;', 'Next');

                // 2. Disabled/Dead State
                if (link.url === null) {
                    return (
                        <span
                            key={index}
                            className="cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-400 opacity-60"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                // 3. Active Link State
                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        preserveState
                        className={cn(
                            'rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200',
                            link.active
                                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                : 'border-gray-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900',
                        )}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </nav>
    );
}
