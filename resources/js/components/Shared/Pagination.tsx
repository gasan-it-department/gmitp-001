import { cn } from '@/lib/utils'; // Assuming you have a utility for tailwind classes
import { Link } from '@inertiajs/react';

interface Props {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export function Pagination({ links }: Props) {
    // Don't render if there is only one page
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-1 py-4">
            {links.map((link, index) => {
                // Handle "Next" and "Previous" labels from Laravel
                const label = link.label.replace('&laquo; Previous', 'Previous').replace('Next &raquo;', 'Next');

                return link.url === null ? (
                    // 1. Disabled Link (e.g., "Previous" on Page 1)
                    <span
                        key={index}
                        className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400"
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                ) : (
                    // 2. Active/Clickable Link
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll // 👈 CRITICAL: Keeps scroll position
                        preserveState // 👈 CRITICAL: Keeps your filter states
                        className={cn(
                            'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                            link.active
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
                        )}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
