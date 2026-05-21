import React from 'react';

/**
 * Icon + uppercase title block used by every section card in the
 * profile setup wizard. Kept tiny on purpose — the visual rhythm of
 * the form depends on this being identical across all sections.
 */
export function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#005088]/10">{icon}</div>
            <h2 className="text-base font-bold tracking-wide text-slate-900 uppercase">{title}</h2>
        </div>
    );
}
