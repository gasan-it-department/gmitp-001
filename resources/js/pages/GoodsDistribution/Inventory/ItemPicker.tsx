import { Button } from '@/components/ui/button';
import goodsDistribution from '@/routes/goodsDistribution';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import axios from 'axios';
import { Check, ChevronDown, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInventoryContext } from './components';
import { useItemCategories } from './ItemCategorySelect';
import type { CatalogRecord, PageData } from './types';

export default function ItemPicker({
    value,
    programId,
    onChange,
    onCreate,
    catalogScope = 'program',
    searchUrl,
    required = true,
}: {
    value: CatalogRecord | null;
    programId?: string | null;
    onChange: (item: CatalogRecord) => void;
    onCreate?: (name: string) => void;
    catalogScope?: 'program' | 'shared';
    searchUrl?: string;
    required?: boolean;
}) {
    const { slug } = useInventoryContext();
    const categories = useItemCategories();
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [records, setRecords] = useState<CatalogRecord[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            setBusy(true);
            setError('');
            void axios
                .get<PageData<CatalogRecord>>(searchUrl ?? goodsDistribution.inventory.api.items.search.url(), {
                    params: searchUrl
                        ? { search: query, program_id: programId || undefined, page }
                        : { q: query, program_id: programId || undefined, catalog_scope: catalogScope, page },
                    headers: { 'X-Municipality-Slug': slug },
                    signal: controller.signal,
                })
                .then(({ data }) => {
                    setRecords((previous) =>
                        page === 1 ? data.data : [...previous, ...data.data.filter((item) => !previous.some((row) => row.id === item.id))],
                    );
                    setHasMore(!!data.links.next);
                })
                .catch((failure: unknown) => {
                    if (!axios.isCancel(failure)) setError('Could not load items.');
                })
                .finally(() => {
                    if (!controller.signal.aborted) setBusy(false);
                });
        }, 200);
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [query, page, programId, slug, retry, catalogScope, searchUrl]);
    useEffect(() => {
        setPage(1);
        setRecords([]);
        setQuery('');
    }, [programId, catalogScope]);
    return (
        <Combobox
            value={value}
            by="id"
            onChange={(item: CatalogRecord | null) => {
                if (item) onChange(item);
            }}
        >
            <div className="relative min-w-0">
                <ComboboxInput
                    aria-label="Item"
                    required={required}
                    autoComplete="off"
                    className="h-10 w-full min-w-0 rounded-md border border-input bg-background pr-12 pl-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    displayValue={(item: CatalogRecord | null) => item?.name ?? ''}
                    placeholder="Search items"
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                        setRecords([]);
                    }}
                />
                <ComboboxButton aria-label="Show items" className="absolute inset-y-0 right-0 flex w-11 items-center justify-center">
                    <ChevronDown className="size-4 text-muted-foreground" />
                </ComboboxButton>
            </div>
            <ComboboxOptions
                anchor={{ to: 'bottom start', gap: 4 }}
                className="z-[70] max-h-[min(20rem,50dvh)] w-[var(--input-width)] max-w-[calc(100vw-2rem)] min-w-0 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none"
            >
                {records.map((item) => (
                    <ComboboxOption
                        key={item.id}
                        value={item}
                        className="group flex min-h-11 cursor-pointer items-center gap-2 rounded px-3 py-2 data-focus:bg-accent"
                    >
                        <Check className="size-4 shrink-0 opacity-0 group-data-selected:opacity-100" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium [overflow-wrap:anywhere]">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {item.code} · {item.base_unit}
                                {item.category ? ` · ${categories.label(item.category)}` : ''}
                                {!item.is_active ? ' · Globally inactive' : item.program_item_active ? ' · Enabled in program' : ''}
                            </p>
                        </div>
                    </ComboboxOption>
                ))}
                {busy && (
                    <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading items
                    </p>
                )}
                {!busy && !records.length && !error && <p className="px-3 py-3 text-sm text-muted-foreground">No items found</p>}
                {error && (
                    <div className="px-3 py-2 text-sm text-destructive">
                        {error}
                        <Button type="button" variant="ghost" size="sm" onClick={() => setRetry((value) => value + 1)}>
                            Retry
                        </Button>
                    </div>
                )}
                {hasMore && !busy && (
                    <Button type="button" variant="ghost" className="w-full" onClick={() => setPage((value) => value + 1)}>
                        Load more
                    </Button>
                )}
                {onCreate && (
                    <div className="border-t border-border pt-1">
                        <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onCreate(query)}>
                            <Plus className="size-4" />
                            Add item
                        </Button>
                    </div>
                )}
            </ComboboxOptions>
        </Combobox>
    );
}
