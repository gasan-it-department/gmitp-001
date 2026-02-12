import { FormInput } from '@/components/FormInputField'; // Your component
import { Label } from '@/components/ui/label'; // Assuming you have this from shadcn
import axios from 'axios';
import { Loader2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
// import { Dialog, DialogContent... } from '@/components/ui/dialog'; // UNCOMMENT if using Shadcn Dialog

// 1. Define the shape of the form (Matches your DTO expectation)
interface CreateOfficialForm {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    gender: string; // 'male' | 'female'
    biography: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    // This callback sends the new official back to the parent without page reload
    onSuccess: (official: any) => void;
}

export const CreateOfficialDialog = ({ isOpen, onClose, onSuccess }: Props) => {
    // 2. Setup React Hook Form
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateOfficialForm>({
        defaultValues: {
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix: '',
            gender: 'male',
            biography: '',
        },
    });

    // 3. The "Side Quest" Submission Logic
    const onSubmit = async (data: CreateOfficialForm) => {
        try {
            // We use Axios directly to avoid refreshing the main Appointment page
            const response = await axios.post('/api/officials', data);

            // Pass the new data back to the parent (AppointOfficialPage)
            onSuccess(response.data.data);

            onClose(); // Close modal
        } catch (error) {
            console.error('Failed to create official', error);
            // You can add setError here if validation fails on server
        }
    };

    // If using a standard Dialog library (like Headless UI or Shadcn),
    // wrap this content in <Dialog><DialogContent>...
    if (!isOpen) return null;

    return (
        // --- MODAL OVERLAY (Replace with your UI Library's Dialog component) ---
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl duration-200 animate-in fade-in zoom-in-95">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b bg-gray-50/50 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Create New Official</h2>
                        <p className="text-xs text-gray-500">Add a person to the provincial database.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
                    {/* ROW 1: Names */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormInput
                            id="first_name"
                            label="First Name"
                            placeholder="e.g. Juan"
                            required
                            isUppercase
                            value={watch('first_name')}
                            onChange={(e) => setValue('first_name', e.target.value)}
                            error={errors.first_name?.message}
                        />
                        <FormInput
                            id="last_name"
                            label="Last Name"
                            placeholder="e.g. Dela Cruz"
                            required
                            isUppercase
                            value={watch('last_name')}
                            onChange={(e) => setValue('last_name', e.target.value)}
                            error={errors.last_name?.message}
                        />
                    </div>

                    {/* ROW 2: Middle & Suffix */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormInput
                            id="middle_name"
                            label="Middle Name (Optional)"
                            placeholder="e.g. Santos"
                            isUppercase
                            value={watch('middle_name')}
                            onChange={(e) => setValue('middle_name', e.target.value)}
                        />
                        <FormInput
                            id="suffix"
                            label="Suffix (Optional)"
                            placeholder="e.g. Jr., III"
                            value={watch('suffix')}
                            onChange={(e) => setValue('suffix', e.target.value)}
                        />
                    </div>

                    {/* ROW 3: Gender & Bio (Manual Inputs since FormInput is text-only) */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* GENDER SELECT */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                                Gender <span className="text-red-500">*</span>
                            </Label>
                            <select
                                {...register('gender')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        {/* BIOGRAPHY */}
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <Label htmlFor="biography" className="text-sm font-medium text-gray-700">
                                Short Biography (Optional)
                            </Label>
                            <textarea
                                {...register('biography')}
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                                placeholder="Brief background of the official..."
                            />
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Official
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
