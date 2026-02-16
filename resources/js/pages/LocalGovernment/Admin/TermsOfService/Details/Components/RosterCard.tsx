import { Plus, User } from 'lucide-react';

interface RosterCardProps {
    position: Position;
    official?: Official | null; // If null/undefined, card renders as "Vacant"
    onClick: (position: Position) => void;
    className?: string;
}

export const RosterCard = ({ position, official, className = '', onClick }: RosterCardProps) => {
    // 1. Determine State
    const isVacant = !official;

    return (
        <button
            type="button"
            onClick={() => onClick(position)}
            className={`group relative flex w-full flex-col items-center justify-center rounded-xl p-5 text-center transition-all duration-200 ${
                isVacant
                    ? 'min-h-[160px] border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                    : 'min-h-[160px] border border-gray-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md hover:ring-2 hover:ring-blue-500/20'
            } ${className} `}
        >
            {/* --- TOP LABEL: Position Title --- */}
            <span
                className={`mb-4 text-xs font-bold tracking-wider uppercase ${isVacant ? 'text-gray-400 group-hover:text-blue-500' : 'text-gray-500'} `}
            >
                {position.title}
            </span>

            {/* --- CENTER VISUAL: Avatar or Action Icon --- */}
            <div className="relative mb-3">
                {isVacant ? (
                    // STATE A: Vacant (The "Add" Visual)
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                        <Plus className="h-8 w-8 text-gray-400 transition-colors group-hover:text-blue-600" />
                    </div>
                ) : (
                    // STATE B: Occupied (The Official's Face)
                    <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-50 shadow-sm ring-1 ring-gray-100">
                            {/* Replace with <img src={official.photo} /> if available */}
                            {official?.profile_url ? (
                                <img src={official.profile_url} alt={official.full_name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-8 w-8 text-blue-600" />
                            )}
                        </div>
                        {/* Status Indicator Dot */}
                        <span className="absolute right-0 bottom-0 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-white"></span>
                    </div>
                )}
            </div>

            {/* --- BOTTOM LABEL: Name or "Vacant" --- */}
            <div className="flex flex-col items-center gap-0.5">
                {isVacant ? (
                    <>
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-blue-700">[ Vacant Slot ]</span>
                        <span className="text-[10px] text-gray-400 group-hover:text-blue-600">Click to appoint</span>
                    </>
                ) : (
                    <>
                        <span className="line-clamp-1 px-2 text-sm font-bold text-gray-900">
                            {/* Assuming official has a full_name field, fallback to parts */}
                            {official?.full_name || `${official?.first_name} ${official?.last_name}`}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                            Active
                        </span>
                    </>
                )}
            </div>

            {/* Optional: Hover overlay effect for occupied cards to imply "Edit" */}
            {!isVacant && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-900/0 transition-all group-hover:bg-blue-900/5">
                    {/* Visual cue that this is clickable/editable */}
                </div>
            )}
        </button>
    );
};
