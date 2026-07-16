import { Pagination } from '@/components/Shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FeedbackData } from '@/Core/Types/Feedback/FeedbackTypes';
import { Municipality } from '@/Core/Types/Municipality/MunicipalityTypes';
import { PaginatedResponse } from '@/Core/Types/Utility/pagination';
import AppLayout from '@/layouts/App/AppLayout';
import Utility from '@/pages/Utility/Utility';
import feedbackRoutes from '@/routes/feedback';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, MessageSquare, Search, Star, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type SelectOption = { value: string; label: string };

type AdminFeedbackFilters = {
    search: string | null;
    department_id: string | null;
    subject: string | null;
    rating: number | null;
    visibility: string | null;
    target: string | null;
    has_attachments: string | null;
    date_from: string | null;
    date_to: string | null;
    sort: string;
    per_page: number;
};

interface Props {
    feedbacks: PaginatedResponse<FeedbackData>;
    filters: AdminFeedbackFilters;
    department_options: SelectOption[];
    subject_options: SelectOption[];
    rating_options: SelectOption[];
    visibility_options: SelectOption[];
    target_options: SelectOption[];
    attachment_options: SelectOption[];
    sort_options: SelectOption[];
    per_page_options: number[];
}

const ALL = 'all';

export default function FeedbackPage({
    feedbacks,
    filters,
    department_options,
    subject_options,
    rating_options,
    visibility_options,
    target_options,
    attachment_options,
    sort_options,
    per_page_options,
}: Props) {
    const { currentMunicipality } = usePage<{ currentMunicipality: Municipality }>().props;
    const slug = currentMunicipality.slug;
    const path = feedbackRoutes.admin.index.url({ municipality: slug });
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const list = feedbacks?.data ?? [];
    const paginationLinks = feedbacks?.meta?.links ?? [];
    const hasActiveFilters = Boolean(
        filters.search ||
            filters.department_id ||
            filters.subject ||
            filters.rating ||
            filters.visibility ||
            filters.target ||
            filters.has_attachments ||
            filters.date_from ||
            filters.date_to ||
            filters.sort !== 'newest' ||
            filters.per_page !== 20,
    );

    useEffect(() => {
        setSearchValue(filters.search ?? '');
    }, [filters.search]);

    const applyFilters = (patch: Partial<AdminFeedbackFilters>) => {
        const nextFilters = {
            ...filters,
            ...patch,
        };

        router.get(
            path,
            cleanQuery({
                search: nextFilters.search,
                department_id: nextFilters.department_id,
                subject: nextFilters.subject,
                rating: nextFilters.rating,
                visibility: nextFilters.visibility,
                target: nextFilters.target,
                has_attachments: nextFilters.has_attachments,
                date_from: nextFilters.date_from,
                date_to: nextFilters.date_to,
                sort: nextFilters.sort === 'newest' ? null : nextFilters.sort,
                per_page: nextFilters.per_page === 20 ? null : nextFilters.per_page,
                page: 1,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters({ search: searchValue.trim() || null });
    };

    const clearFilters = () => {
        setSearchValue('');
        router.get(path, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Community Feedback" />

            <div className="m-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Community Feedback</h1>
                        <p className="text-sm text-muted-foreground">Manage and view feedback submitted by residents.</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {feedbacks.meta.total} total {feedbacks.meta.total === 1 ? 'feedback' : 'feedback entries'}
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <form onSubmit={submitSearch} className="grid gap-2 lg:grid-cols-[minmax(240px,1fr)_auto]">
                        <Input
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search subject, message, employee, or department..."
                        />
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                    </form>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(5,minmax(130px,1fr))_repeat(2,minmax(120px,0.8fr))_minmax(150px,1fr)_minmax(140px,0.8fr)_auto]">
                        <FilterSelect
                            value={filters.department_id}
                            placeholder="Department"
                            options={department_options}
                            onChange={(departmentId) => applyFilters({ department_id: departmentId })}
                        />
                        <FilterSelect
                            value={filters.subject}
                            placeholder="Type"
                            options={subject_options}
                            onChange={(subject) => applyFilters({ subject })}
                        />
                        <FilterSelect
                            value={filters.rating === null ? null : String(filters.rating)}
                            placeholder="Rating"
                            options={rating_options}
                            onChange={(rating) => applyFilters({ rating: rating ? Number(rating) : null })}
                        />
                        <FilterSelect
                            value={filters.visibility}
                            placeholder="Visibility"
                            options={visibility_options}
                            onChange={(visibility) => applyFilters({ visibility })}
                        />
                        <FilterSelect
                            value={filters.target}
                            placeholder="Target"
                            options={target_options}
                            onChange={(target) => applyFilters({ target })}
                        />
                        <FilterSelect
                            value={filters.has_attachments}
                            placeholder="Evidence"
                            options={attachment_options}
                            onChange={(hasAttachments) => applyFilters({ has_attachments: hasAttachments })}
                        />
                        <Input
                            type="date"
                            value={filters.date_from ?? ''}
                            onChange={(event) => applyFilters({ date_from: event.target.value || null })}
                            aria-label="From date"
                        />
                        <Input
                            type="date"
                            value={filters.date_to ?? ''}
                            onChange={(event) => applyFilters({ date_to: event.target.value || null })}
                            aria-label="To date"
                        />
                        <FilterSelect
                            value={filters.sort}
                            placeholder="Sort"
                            options={sort_options}
                            allLabel={null}
                            onChange={(sort) => applyFilters({ sort: sort ?? 'newest' })}
                        />
                        <div className="flex gap-2">
                            <FilterSelect
                                value={String(filters.per_page)}
                                placeholder="Per page"
                                options={per_page_options.map((value) => ({ value: String(value), label: `${value} / page` }))}
                                allLabel={null}
                                onChange={(perPage) => applyFilters({ per_page: Number(perPage ?? 20) })}
                            />
                            <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasActiveFilters} className="shrink-0 gap-2">
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Target Party</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Sender</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Date Reported</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                            <MessageSquare className="h-8 w-8 opacity-40" />
                                            <span>{hasActiveFilters ? 'No feedback matches the current filters.' : 'No feedback yet.'}</span>
                                            {hasActiveFilters && <span className="text-xs">Adjust or clear the filters to see more feedback.</span>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {list.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{item.department?.name || 'No Department'}</span>
                                            {item.employee_name && (
                                                <span className="text-xs text-muted-foreground">Employee: {item.employee_name}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                            {item.subject || '—'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[20rem]">
                                        <span className="line-clamp-2 text-xs">{item.message}</span>
                                    </TableCell>
                                    <TableCell>
                                        {item.is_anonymous || !item.citizen_name ? (
                                            <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                                Anonymous
                                            </Badge>
                                        ) : (
                                            <span className="text-sm">{item.citizen_name}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <span className="text-sm font-bold">{item.rating || 0}</span>
                                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {Utility().formatToReadableDate(item.created_at) ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                href={feedbackRoutes.admin.show.url({
                                                    municipality: slug,
                                                    feedback: item.id,
                                                })}
                                            >
                                                <Button size="sm" variant="ghost" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination links={paginationLinks} />
            </div>
        </AppLayout>
    );
}

function FilterSelect({
    value,
    placeholder,
    options,
    allLabel = 'All',
    onChange,
}: {
    value: string | null;
    placeholder: string;
    options: SelectOption[];
    allLabel?: string | null;
    onChange: (value: string | null) => void;
}) {
    return (
        <Select value={value ?? ALL} onValueChange={(selected) => onChange(selected === ALL ? null : selected)}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {allLabel !== null && <SelectItem value={ALL}>{allLabel}</SelectItem>}
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function cleanQuery(values: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== null && value !== undefined && value !== ''));
}
