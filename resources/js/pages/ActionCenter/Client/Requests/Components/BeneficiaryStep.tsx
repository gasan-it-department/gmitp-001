import { Plus, User } from 'lucide-react';
import { useState } from 'react';
import CreateMemberDialogue from '../../Household/Partials/CreateMemberDialogue'; // Point to your modal

export default function BeneficiaryStep({ members, value, onChange }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
            <div className="mb-8 space-y-2 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Who needs assistance?</h2>
                <p className="text-gray-500">Select the person from your registered household list.</p>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-bold tracking-wide text-gray-700 uppercase">Select Beneficiary</label>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="block w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition-shadow focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="">-- Choose a person --</option>
                            {/* {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.first_name} {m.last_name} ({m.relationship})
                                </option>
                            ))} */}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-blue-100 px-4 font-bold text-blue-700 transition-colors hover:bg-blue-200"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="hidden md:inline">New Profile</span>
                    </button>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">TIP</div>
                    <p className="text-sm leading-tight text-blue-800">
                        If the person is not in the list, click <strong>New Profile</strong> to register them first. They will be automatically
                        selected after saving.
                    </p>
                </div>
            </div>

            {/* The Modal Component */}
            <CreateMemberDialogue
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(newMember) => {
                    // Logic handled by Inertia refresh, but we can set the ID here
                    onChange(newMember.id);
                }}
            />
        </div>
    );
}
