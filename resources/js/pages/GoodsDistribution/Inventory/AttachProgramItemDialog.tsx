import { Button } from '@/components/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import goodsDistribution from '@/routes/goodsDistribution';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Errors, useInventoryContext } from './components';
import ItemPicker from './ItemPicker';
import type { CatalogRecord, ProgramItemRecord } from './types';

export default function AttachProgramItemDialog({
    programId,
    initialItem = null,
    onClose,
    onSaved,
}: {
    programId: string;
    onClose: () => void;
    onSaved: (item: CatalogRecord) => void;
    initialItem?: CatalogRecord | null;
}) {
    const { slug } = useInventoryContext();
    const [item, setItem] = useState<CatalogRecord | null>(initialItem);
    const [confirmed, setConfirmed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const save = async () => {
        if (!item) return;
        setBusy(true);
        setErrors({});
        try {
            const response = await axios.post<{ data: ProgramItemRecord }>(
                goodsDistribution.inventory.api.programItems.store.url({ programId }),
                { item_id: item.id, reactivate_global: confirmed },
                { headers: { 'X-Municipality-Slug': slug } },
            );
            onSaved(response.data.data.item);
        } catch (error) {
            const data = axios.isAxiosError(error) ? error.response?.data : null;
            setErrors(
                data?.errors
                    ? Object.fromEntries(
                          Object.entries(data.errors).map(([key, value]) => [key, Array.isArray(value) ? String(value[0]) : String(value)]),
                      )
                    : { item: data?.message ?? 'Could not add this item.' },
            );
        } finally {
            setBusy(false);
        }
    };
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !busy) onClose();
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add existing item to program</DialogTitle>
                </DialogHeader>
                <Errors errors={errors} />
                <ItemPicker
                    value={item}
                    programId={programId}
                    catalogScope="shared"
                    onChange={(value) => {
                        setItem(value);
                        setConfirmed(false);
                        setErrors({});
                    }}
                />
                {item && !item.is_active && (
                    <section className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                        <p>
                            This item is globally inactive. Reactivating it affects every connected program with an enabled item
                            {item.connected_programs?.length ? `: ${item.connected_programs.map((entry) => entry.name).join(', ')}` : ''}.
                        </p>
                        <label className="flex items-start gap-2">
                            <input className="mt-1" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                            Reactivate the shared item and enable it here.
                        </label>
                    </section>
                )}
                <DialogFooter>
                    <Button variant="outline" disabled={busy} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={busy || !item || (!item.is_active && !confirmed)} onClick={() => void save()}>
                        <Plus className="size-4" />
                        {busy ? 'Adding item' : item?.program_item_active && item.is_active ? 'Use enabled item' : 'Enable in program'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
