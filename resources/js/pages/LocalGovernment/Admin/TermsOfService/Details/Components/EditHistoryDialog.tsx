import UpdateHistoricalAppointmentController from '@/actions/App/External/Api/Controllers/Government/OfficialTerms/UpdateHistoricalAppointmentController';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Assuming your path
import { useMunicipality } from '@/Core/Context/MunicipalityContext';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface Props {
    isOpen: boolean;
    record: OfficialTerm | null;
    onClose: () => void;
}

export const EditHistoryDialog = ({ isOpen, record, onClose }: Props) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        actual_start_date: '',
        actual_end_date: '',
        status: '',
        remarks: '',
    });
    const { currentMunicipality } = useMunicipality();
    // Sync form data when record changes
    useEffect(() => {
        if (record) {
            setData({
                actual_start_date: record.actual_start_date?.split('T')[0] ?? '',
                actual_end_date: record.actual_end_date?.split('T')[0] ?? '',
                status: record.status ?? '',
                remarks: record.remarks ?? '',
            });
        }
    }, [record]);
    console.log('this', record);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!record) return;

        put(UpdateHistoricalAppointmentController.url(record.id), {
            headers: {
                'X-Municipality-Slug': currentMunicipality.slug,
            },
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Historical Record</DialogTitle>
                    <DialogDescription>Correcting history for {record?.official?.formatted_name}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                            <input
                                type="date"
                                value={data.actual_start_date}
                                onChange={(e) => setData('actual_start_date', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                            {errors.actual_start_date && <p className="text-xs text-destructive">{errors.actual_start_date}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                            <input
                                type="date"
                                value={data.actual_end_date}
                                onChange={(e) => setData('actual_end_date', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                            {errors.actual_end_date && <p className="text-xs text-destructive">{errors.actual_end_date}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Select Status...</option>
                            <option value="resigned">Resigned</option>
                            <option value="deceased">Deceased</option>
                            <option value="promoted">Promoted</option>
                            <option value="others">Others</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Remarks</label>
                        <textarea
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Reason for correction..."
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <button type="button" onClick={onClose} className="text-sm font-medium text-slate-600 hover:underline">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
