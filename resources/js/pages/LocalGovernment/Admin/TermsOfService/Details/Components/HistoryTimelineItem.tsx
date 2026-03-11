import RemoveOfficialAppointmentController from '@/actions/App/External/Api/Controllers/Government/OfficialTerms/RemoveOfficialAppointmentController';
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { router } from '@inertiajs/react';
import { Edit2, Trash2 } from 'lucide-react';

interface Props {
    record: OfficialTerm;
    onEdit: (record: OfficialTerm) => void;
}

export const HistoryTimelineItem = ({ record, onEdit }: Props) => {
    const { currentMunicipality } = useMunicipality();
    const handleDelete = () => {
        if (!confirm(`Are you sure you want to permanently delete the historical record for ${record.official?.formatted_name}?`)) {
            return;
        }

        router.delete(RemoveOfficialAppointmentController.url(record.id), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            preserveScroll: true,
            // onFinish: () => setIsSubmitting(false),
            // onSuccess: () => onClose(),
        });
    };
    const formatTimelineDate = (dateString: string) => {
        if (!dateString) return 'N/A'; // Safe fallback
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="group relative pl-6 opacity-80 transition-all hover:opacity-100">
            {/* The Timeline Dot */}
            <div className="absolute top-1.5 -left-[7px] h-3 w-3 rounded-full bg-slate-300 ring-4 ring-white" />

            <div className="flex items-start justify-between rounded-lg p-2 transition-colors group-hover:bg-slate-50">
                {/* Data Section */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700">{record.official?.formatted_name ?? 'Unknown Official'}</h4>

                    <div className="mt-1 space-y-1 text-xs text-slate-500">
                        <p className="font-medium">
                            {formatTimelineDate(record.actual_start_date)} — {formatTimelineDate(record.actual_end_date!)}
                        </p>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                                {record.status || 'Past'}
                            </span>
                            {/* {record.remarks && <span className="text-slate-400 italic">"{record.remarks}"</span>} */}
                        </div>
                    </div>
                </div>

                {/* Actions Section (Hidden until hover) */}
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={() => onEdit(record)}
                        title="Edit Record"
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        title="Delete Record"
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
