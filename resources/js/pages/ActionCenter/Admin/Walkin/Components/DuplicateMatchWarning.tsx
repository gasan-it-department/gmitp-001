import ShowBeneficiaryProfileController from '@/actions/App/External/Web/Controllers/ActionCenter/Admin/Beneficiary/ShowBeneficiaryProfileController';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, BadgeCheck } from 'lucide-react';

/** Mirrors App\External\Api\Resources\ActionCenter\Walkin\WalkInBeneficiaryResource. */
export interface WalkInMatch {
    id: string;
    full_name: string;
    sex_label: string | null;
    birth_date: string | null;
    age: number | null;
    barangay: string | null;
    has_account: boolean;
    account_email: string | null;
}

interface Props {
    matches: WalkInMatch[];
    municipalitySlug: string;
    onRegisterAnyway: () => void;
    processing: boolean;
}

/**
 * Surfaced when the soft duplicate guard blocks a walk-in submission: one or
 * more existing beneficiaries share this name + birth date. The admin opens
 * each profile to verify, then either abandons (it's the same person) or
 * confirms "different person — register anyway" (resubmits with force = true).
 *
 * This is the walk-in flow's main duplicate control, since UNIQUE(user_id)
 * can't protect NULL-user records.
 */
export function DuplicateMatchWarning({ matches, municipalitySlug, onRegisterAnyway, processing }: Props) {
    if (matches.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 rounded-3xl border-2 border-red-200 bg-red-50/60 p-6">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                    <h3 className="text-sm font-bold text-red-800">
                        Possible existing record{matches.length === 1 ? '' : 's'} found
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-red-700">
                        {matches.length} {matches.length === 1 ? 'person' : 'people'} with this name and birth date already
                        exist in this municipality. Open the profile to check. Only register again if this is genuinely a
                        different person.
                    </p>
                </div>
            </div>

            <ul className="space-y-2">
                {matches.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-white p-4">
                        <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900 capitalize">
                                {m.full_name.toLowerCase()}
                                {m.has_account && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                        <BadgeCheck className="h-3 w-3" /> Has account
                                    </span>
                                )}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {[m.sex_label, m.age !== null ? `${m.age} yrs` : null, m.barangay].filter(Boolean).join(' • ') || '—'}
                            </p>
                        </div>
                        <Link
                            href={ShowBeneficiaryProfileController.url({ municipality: municipalitySlug, beneficiaryId: m.id })}
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                        >
                            View profile <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-red-200 pt-3">
                <p className="mr-auto text-xs text-red-700">If none of these are the same person:</p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onRegisterAnyway}
                    disabled={processing}
                    className="border-red-300 bg-white text-red-700 hover:bg-red-100"
                >
                    These are different people — Register anyway
                </Button>
            </div>
        </div>
    );
}
