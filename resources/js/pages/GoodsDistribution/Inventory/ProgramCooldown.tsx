import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoodsDialogContent as DialogContent } from '../GoodsDialog';
import { Input } from '@/components/ui/input';
import goodsDistribution from '@/routes/goodsDistribution';
import { router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Errors, Field, inputClass, useInventoryMutation } from './components';
import type { Program } from './types';

export default function ProgramCooldown({ program, canManage }: { program: Program; canManage: boolean }) {
    const mutation = useInventoryMutation();
    const [enabled, setEnabled] = useState(program.cooldown_enabled ?? false);
    const [scope, setScope] = useState(program.cooldown_scope ?? 'household');
    const [unit, setUnit] = useState(program.cooldown_unit ?? 'months');
    const [duration, setDuration] = useState(program.cooldown_duration?.toString() ?? '');
    const [confirm, setConfirm] = useState(false);
    const save = async () => {
        const result = await mutation.submit(
            goodsDistribution.inventory.api.programCooldown.url({ programId: program.id }),
            {
                cooldown_enabled: enabled,
                cooldown_scope: scope,
                cooldown_duration: enabled ? Number(duration) : null,
                cooldown_unit: enabled ? unit : null,
            },
            'patch',
        );
        if (result) {
            setConfirm(false);
            router.reload();
        }
    };
    return (
        <section className="max-w-2xl space-y-5 border-y border-[#dfe6e1] py-5" aria-label="Program cooldown settings">
            <h2 className="text-base font-semibold">Cooldown</h2>
            <form
                className="space-y-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    setConfirm(true);
                }}
            >
                <Errors errors={mutation.errors} />
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={enabled} disabled={!canManage || mutation.busy} onChange={(e) => setEnabled(e.target.checked)} />
                    Timed cooldown
                </label>
                {enabled && (
                    <div className="grid gap-4 @min-[640px]/goods:grid-cols-3">
                        <Field label="Duration">
                            <Input
                                required
                                type="number"
                                min={1}
                                max={3650}
                                step={1}
                                disabled={!canManage || mutation.busy}
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </Field>
                        <Field label="Unit">
                            <select
                                className={inputClass}
                                value={unit}
                                disabled={!canManage || mutation.busy}
                                onChange={(e) => setUnit(e.target.value as typeof unit)}
                            >
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Calendar months</option>
                            </select>
                        </Field>
                        <Field label="Scope">
                            <select
                                className={inputClass}
                                value={scope}
                                disabled={!canManage || mutation.busy}
                                onChange={(e) => setScope(e.target.value as typeof scope)}
                            >
                                <option value="recipient">Recipient</option>
                                <option value="household">Household</option>
                            </select>
                        </Field>
                    </div>
                )}
                {canManage && (
                    <Button disabled={mutation.busy} className="bg-[#245e4f] text-white">
                        <Save className="size-4" />
                        {mutation.busy ? 'Saving' : 'Save cooldown policy'}
                    </Button>
                )}
            </form>
            <Dialog
                open={confirm}
                onOpenChange={(open) => {
                    if (!mutation.busy) setConfirm(open);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apply cooldown policy?</DialogTitle>
                        <DialogDescription>
                            Future handovers: {enabled ? `${duration} ${unit} per ${scope}` : 'Cooldown disabled'}. Existing recorded cooldowns keep
                            their original expiry.
                        </DialogDescription>
                    </DialogHeader>
                    <Errors errors={mutation.errors} />
                    <DialogFooter>
                        <Button variant="outline" disabled={mutation.busy} onClick={() => setConfirm(false)}>
                            Cancel
                        </Button>
                        <Button disabled={mutation.busy} onClick={() => void save()}>
                            {mutation.busy ? 'Saving' : 'Apply policy'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
