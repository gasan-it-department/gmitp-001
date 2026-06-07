import { AlertTriangle, Phone } from 'lucide-react';

/** Mirrors App\External\Api\Resources\ActionCenter\CrossMunicipalityMatchResource. */
export interface CrossMunicipalityMatch {
    municipality_name: string;
    municipal_code: string | null;
    contact: string | null;
}

interface Props {
    matches: CrossMunicipalityMatch[];
    /** Tightens the copy for the cashier at the release gate. */
    context?: 'profile' | 'release';
}

/**
 * Advisory cross-municipality double-dip warning.
 *
 * Shown when the exact same person (name + birth date + sex) is on record in
 * another LGU. It deliberately reveals ONLY which municipality and a hotline to
 * coordinate — never the other LGU's record, amounts, or history (that stays in
 * their tenant). It NEVER blocks: relocating is legitimate, and name+DOB can
 * collide. The admin verifies identity and coordinates before releasing aid.
 */
export function CrossMunicipalityWarning({ matches, context = 'profile' }: Props) {
    if (!matches || matches.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                    <h3 className="text-sm font-bold text-amber-900">Also on record in another municipality</h3>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                        A person with the same name and birth date is registered in{' '}
                        {matches.length === 1 ? 'another LGU' : `${matches.length} other LGUs`}. This may be the same
                        individual receiving assistance elsewhere.{' '}
                        {context === 'release'
                            ? 'Verify identity and coordinate with that office before releasing aid.'
                            : 'Verify identity and coordinate before approving or releasing aid.'}
                    </p>
                </div>
            </div>

            <ul className="space-y-1.5">
                {matches.map((m, i) => (
                    <li
                        key={`${m.municipality_name}-${i}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2"
                    >
                        <span className="text-sm font-semibold text-slate-800">MSWD {m.municipality_name}</span>
                        {m.contact ? (
                            <a
                                href={`tel:${m.contact}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:underline"
                            >
                                <Phone className="h-3.5 w-3.5" /> {m.contact}
                            </a>
                        ) : (
                            <span className="text-xs text-slate-400">No hotline on file</span>
                        )}
                    </li>
                ))}
            </ul>

            <p className="text-[11px] text-amber-700/80">
                This is an advisory check, not a block — names and birth dates can occasionally match between different
                people. It does not expose the other municipality&rsquo;s records.
            </p>
        </div>
    );
}
