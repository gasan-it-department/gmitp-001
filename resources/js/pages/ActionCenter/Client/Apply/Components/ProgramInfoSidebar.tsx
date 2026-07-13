import { AssistanceTypeDetails } from '@/Core/Types/ActionCenter/assistance';
import { Banknote, CalendarClock } from 'lucide-react';
import { DocumentsToBringChecklist } from './DocumentsToBringChecklist';

interface Props {
    assistanceType: AssistanceTypeDetails;
    requireRecipientIdentity?: boolean;
}

/**
 * Left-column sidebar shown on the Apply page.
 * Displays:
 *   - Program name + description in a colored banner
 *   - Allocated cap (max_amount) and cooldown period if configured
 *   - Required / optional document checklist
 *
 * Pure presentational component — no form state, no submission logic.
 */
export function ProgramInfoSidebar({ assistanceType, requireRecipientIdentity = false }: Props) {
    const hasMaxAmount = assistanceType.max_amount !== null && Number(assistanceType.max_amount) > 0;
    const isOneTime = assistanceType.cooldown_type === 'one_time';
    const hasCooldown = isOneTime || assistanceType.cooldown_months > 0;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-[#005088] p-8 text-white shadow-xl shadow-blue-900/10">
                <h1 className="text-2xl leading-tight font-bold tracking-tight uppercase">{assistanceType.name}</h1>
                <p className="mt-4 text-sm leading-relaxed text-blue-100 opacity-90">{assistanceType.description}</p>

                <div className="mt-8 space-y-4">
                    {hasMaxAmount && (
                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
                                <Banknote className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-widest text-blue-200 uppercase">Allocated Cap</p>
                                <p className="text-lg font-bold">₱{Number(assistanceType.max_amount).toLocaleString()}</p>
                                <p className="mt-0.5 text-[10px] text-blue-100 opacity-75">Final amount is decided by the approver.</p>
                            </div>
                        </div>
                    )}

                    {hasCooldown && (
                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
                                <CalendarClock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-widest text-blue-200 uppercase">Availability</p>
                                {isOneTime ? (
                                    <p className="text-lg font-bold">One-Time Only</p>
                                ) : (
                                    <p className="text-lg font-bold">Every {assistanceType.cooldown_months} Months</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DocumentsToBringChecklist documents={assistanceType.documents} requireRecipientIdentity={requireRecipientIdentity} compact />
        </div>
    );
}
