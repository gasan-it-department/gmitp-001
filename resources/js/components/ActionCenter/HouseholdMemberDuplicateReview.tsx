import ShowHouseholdProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Household/ShowHouseholdProfileController';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { HouseholdMemberDuplicateCheck } from '@/Core/Hooks/ActionCenter/useHouseholdMemberDuplicateCheck';
import { usePermissions } from '@/Core/Hooks/Shared/usePermissions';
import { AlertTriangle, ExternalLink, Loader2, RefreshCw, UserCheck, X } from 'lucide-react';

export default function HouseholdMemberDuplicateReview({
    check,
    municipality,
    onCancel,
}: {
    check: HouseholdMemberDuplicateCheck;
    municipality: string;
    onCancel: () => void;
}) {
    const { can } = usePermissions();
    if (!check.visible) return null;
    if (check.loading)
        return (
            <p role="status" className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking existing household records...
            </p>
        );
    if (check.error)
        return (
            <div role="status" className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-3 text-sm">
                <p>Match check unavailable. Saving will recheck the registry.</p>
                <Button type="button" variant="outline" size="sm" onClick={check.refresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    if (!check.candidates.length)
        return (
            <p role="status" className="text-xs text-slate-500">
                No possible existing member found.
            </p>
        );

    return (
        <section aria-label="Possible existing household members" className="min-w-0 rounded-md border border-amber-200 bg-amber-50/60">
            <div className="flex items-start gap-2 border-b border-amber-200 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div>
                    <h3 className="text-sm font-semibold text-amber-950">Possible existing household member</h3>
                    <p className="mt-1 text-xs text-amber-900">Review these records before creating another person.</p>
                </div>
            </div>
            <ul className="max-h-72 divide-y divide-amber-200 overflow-y-auto">
                {check.candidates.map((candidate) => (
                    <li key={candidate.key} className="min-w-0 space-y-2 p-3 text-sm">
                        <p className="font-semibold break-words">{candidate.full_name}</p>
                        <dl className="grid min-w-0 grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                            <div>
                                <dt className="text-slate-500">Birth date</dt>
                                <dd>{candidate.birth_date ?? 'Not recorded'}</dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="text-slate-500">Household</dt>
                                <dd className="break-all">{candidate.household_code ?? 'Not recorded'}</dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="text-slate-500">Household head</dt>
                                <dd className="break-words">{candidate.head_name ?? 'Not recorded'}</dd>
                            </div>
                            <div className="min-w-0">
                                <dt className="text-slate-500">Barangay</dt>
                                <dd className="break-words">{candidate.barangay ?? 'Not recorded'}</dd>
                            </div>
                        </dl>
                        <p className="text-xs text-slate-600">{candidate.membership_status}</p>
                        {can('action_center.beneficiaries.view') && (
                            <a
                                href={ShowHouseholdProfileController.url({ municipality, householdId: candidate.household_id })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium underline underline-offset-4"
                            >
                                View existing record
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span className="sr-only"> (new tab)</span>
                            </a>
                        )}
                    </li>
                ))}
            </ul>
            <div className="space-y-3 border-t border-amber-200 p-3">
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant={check.selected ? 'default' : 'outline'} size="sm" onClick={check.select}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Different person
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel adding
                    </Button>
                </div>
                {check.selected && (
                    <div className="space-y-1.5">
                        <Label htmlFor="different-person-reason">Why is this a different person?</Label>
                        <Textarea
                            id="different-person-reason"
                            rows={2}
                            minLength={10}
                            maxLength={1000}
                            value={check.reason}
                            onChange={(event) => check.setReason(event.target.value)}
                        />
                        <p className="text-xs text-slate-600">Required review reason, at least 10 characters.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
