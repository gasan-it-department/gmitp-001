import { Check, Users } from 'lucide-react';

export default function HouseholdStep({ members, beneficiaryId, selectedIds, onToggle }: any) {
    // Filter out the beneficiary themselves (they can't be their own housemate)
    const housemates = members.filter((m) => String(m.id) !== String(beneficiaryId));

    return (
        <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
            <div className="mb-8 space-y-2 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Household Composition</h2>
                <p className="text-gray-500">Who else lives in the same house with the beneficiary?</p>
            </div>

            {housemates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                    <Users className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                    <p className="text-gray-500">No other registered members found.</p>
                    <p className="text-sm text-gray-400">You can proceed if they live alone.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {housemates.map((member) => {
                        const isSelected = selectedIds.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                onClick={() => onToggle(member.id)}
                                className={`relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200 ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                                } `}
                            >
                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-transparent'} `}
                                >
                                    <Check className="h-4 w-4" />
                                </div>

                                <div>
                                    <h4 className={`font-bold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {member.first_name} {member.last_name}
                                    </h4>
                                    <span className="text-xs font-semibold text-gray-500 uppercase">{member.relationship}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
