import { TooltipProvider } from '@/components/ui/tooltip';
import AdminLayout from '@/layouts/App/AppLayout';
import goodsDistribution from '@/routes/goodsDistribution';
import { Head, Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Pagination, programUrl, useInventoryContext } from './components';
import type { PageData, Program } from './types';

export function DirectoryLayout({
    title,
    actions,
    children,
    dialogs,
    program,
    rootHref,
}: {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
    dialogs?: ReactNode;
    program?: Program | null;
    rootHref?: string;
}) {
    const { slug } = useInventoryContext();
    return (
        <AdminLayout>
            <Head title={`Goods Distribution ${title}`} />
            <TooltipProvider delayDuration={200}>
                <main className="min-h-[calc(100dvh-4rem)] flex-1 bg-[#f6f8f7] px-4 py-6 text-[#243c33] sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <header className="flex flex-wrap items-end justify-between gap-4">
                            <div className="max-w-full min-w-0">
                                <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#75827c]">
                                    <Link
                                        href={rootHref ?? goodsDistribution.inventory.programs.url({ municipality: slug })}
                                        className="hover:text-[#245e4f]"
                                    >
                                        Goods Distribution
                                    </Link>
                                    <ChevronRight className="size-3" />
                                    {program && (
                                        <>
                                            <Link href={programUrl(slug, program.id)} className="[overflow-wrap:anywhere] hover:text-[#245e4f]">
                                                {program.name}
                                            </Link>
                                            <ChevronRight className="size-3" />
                                        </>
                                    )}
                                    <span aria-current="page" className="[overflow-wrap:anywhere] text-[#394c43]">
                                        {title}
                                    </span>
                                </nav>
                                <h1 className="text-2xl font-semibold [overflow-wrap:anywhere]">{title}</h1>
                            </div>
                            {actions}
                        </header>
                        {children}
                    </div>
                </main>
                {dialogs}
            </TooltipProvider>
        </AdminLayout>
    );
}

export function DirectoryPanel({
    label,
    countLabel,
    toolbar,
    children,
}: {
    label: string;
    countLabel: string;
    toolbar: ReactNode;
    children: ReactNode;
}) {
    return (
        <section aria-label={label} className="overflow-hidden rounded-md border border-[#dfe6e1] bg-white">
            {toolbar && (
                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-[#e8ede9] px-4 py-4 sm:px-5">
                    {toolbar}
                </div>
            )}
            <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-[#75827c]">
                <span>{label}</span>
                <span className="tabular-nums">{countLabel}</span>
            </div>
            {children}
        </section>
    );
}

export function DirectoryPagination<T>({ records }: { records: PageData<T> }) {
    return (
        <div className="px-5 py-4 [&_button]:size-8 [&_button]:border-[#dfe6e1] [&_button]:text-[#607d6b] [&_footer]:border-[#e8ede9] [&_footer]:text-xs">
            <Pagination records={records} />
        </div>
    );
}

export function DirectoryStatus({ active }: { active: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] ${active ? 'border-[#dce9e0] bg-[#f4f8f5] text-[#44785c]' : 'border-[#e5e8e6] bg-[#fafbfa] text-[#859088]'}`}
        >
            <span className={`size-1.5 rounded-full ${active ? 'bg-[#649674]' : 'bg-[#a7afa9]'}`} />
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}
