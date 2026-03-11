import { Heart, MapPin, UserPlus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newMember: any) => void;
}

interface MemberFormInputs {
    first_name: string;
    last_name: string;
    middle_name?: string;
    birth_date: string;
    relationship: string;
    province: string;
    municipality: string;
    barangay: string;
    purok?: string;
    street_address?: string;
}

export default function CreateMemberDialogue({ isOpen, onClose, onSuccess }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<MemberFormInputs>({
        // We can use a partial of your schema or a dedicated ProfileSchema
        defaultValues: {
            province: 'Marinduque',
            municipality: 'Gasan',
            relationship: 'Neighbor',
        },
    });

    const onSubmit = (data: any) => {
        // router.post(route('action-center.members.store'), data, {
        //     onSuccess: (page) => {
        //         // Assuming your controller returns the new member in the flash or props
        //         onSuccess(page.props.flash.newMember);
        //         reset();
        //         onClose();
        //     },
        // });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm duration-200 animate-in fade-in">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Register New Person</h2>
                            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Beneficiary Profiling</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-gray-200">
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 overflow-y-auto p-8">
                    {/* Section 1: Identity */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm font-bold tracking-widest uppercase">Personal Information</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <input {...register('first_name')} className="form-input-styled" placeholder="e.g. Juan" />
                                {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message?.toString()}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <input {...register('last_name')} className="form-input-styled" placeholder="e.g. Dela Cruz" />
                                {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message?.toString()}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Middle Name (Full)</label>
                                <input {...register('middle_name')} className="form-input-styled" placeholder="Optional" />
                                {errors.middle_name && <p className="text-xs text-red-500">{errors.middle_name.message?.toString()}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Birth Date</label>
                                <input type="date" {...register('birth_date')} className="form-input-styled" />
                                {errors.birth_date && <p className="text-xs text-red-500">{errors.birth_date.message?.toString()}</p>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Relationship to You</label>
                            <select {...register('relationship')} className="form-input-styled">
                                <option value="Neighbor">Neighbor</option>
                                <option value="Relative">Relative</option>
                                <option value="Self">Self (Account Holder)</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                            </select>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: Address */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-bold tracking-widest uppercase">Permanent Address</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Barangay</label>
                                <select {...register('barangay')} className="form-input-styled">
                                    <option value="Poblacion">Poblacion</option>
                                    <option value="Bachao">Bachao</option>
                                    {/* Add all Gasan barangays here */}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Purok / Sitio</label>
                                <input {...register('purok')} className="form-input-styled" placeholder="e.g. Zone 1" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs leading-relaxed text-blue-700">
                            <strong>Note:</strong> Ensure the name matches the government-issued ID. This profile will be saved permanently to your
                            household list.
                        </p>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-6 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Register Person'}
                    </button>
                </div>
            </div>
        </div>
    );
}
