import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CommunityReportData } from '@/Core/Types/CommunityReportPage/CommunityReportPageTypes';
import Utility from '@/pages/Utility/Utility';
import { ImageIcon, MapPin, Phone, User } from 'lucide-react';

interface ViewCommunityReportsProps {
    isOpen: boolean;
    data: CommunityReportData | null;
    onClose: () => void;
}

export default function ViewCommunityReportDialog({ isOpen, data, onClose }: ViewCommunityReportsProps) {
    if (!data) return null;

    console.log('Attached files: ', data.files);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl sm:max-w-2xl">
                {/* HEADER */}
                <DialogHeader className="border-b border-orange-200 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">Community Report</DialogTitle>

                    <p className="mt-1 text-sm text-gray-500">{Utility().formatToReadableDate(new Date().toISOString())}</p>
                </DialogHeader>

                {/* BODY */}
                <div className="custom-scrollbar max-h-[65vh] space-y-6 overflow-y-auto px-4 py-5">
                    {/* ISSUE TYPE */}
                    <Field label="Issue Type" value={data.type.toUpperCase()} />

                    {/* LOCATION */}
                    <div>
                        <Label>Location</Label>
                        <div className="relative mt-2 flex items-start gap-3 rounded-md border border-orange-200 bg-white p-3">
                            <MapPin className="mt-1 h-5 w-5 text-orange-600" />
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{data.location}</p>

                                {data.latitude && data.longitude && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        ({data.latitude}, {data.longitude})
                                    </p>
                                )}
                            </div>

                            {/* GOOGLE MAP BUTTON */}
                            <button
                                disabled={!data.latitude || !data.longitude}
                                onClick={() => {
                                    const url = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
                                    window.open(url, '_blank');
                                }}
                                className={`ml-auto rounded-md px-3 py-1 text-xs font-medium shadow-sm transition-all ${
                                    data.latitude && data.longitude
                                        ? 'cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                                        : 'cursor-not-allowed bg-gray-200 text-gray-400'
                                } `}
                            >
                                View on Map
                            </button>
                        </div>
                    </div>

                    {/* REPORT DETAILS */}
                    <div>
                        <Label>Description</Label>
                        <div className="mt-2 rounded-md border border-orange-200 bg-gray-50 p-4 whitespace-pre-wrap text-gray-800">
                            {data.description}
                        </div>
                    </div>

                    {/* SENDER */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FieldWithIcon icon={<User className="h-4 w-4 text-orange-600" />} label="Sender" value={data.sender_name || 'Anonymous'} />

                        <FieldWithIcon
                            icon={<Phone className="h-4 w-4 text-orange-600" />}
                            label="Contact"
                            value={data.contact ? data.contact : 'Not provided'}
                        />
                    </div>

                    {/* FILES */}
                    <div>
                        <Label>Attached Files</Label>

                        {data.files?.length > 0 ? (
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {data.files.map((file, index) => (
                                    <div key={index} className="flex items-center gap-3 rounded-md border border-orange-200 bg-white p-3">
                                        <ImageIcon className="h-5 w-5 text-orange-600" />
                                        <div className="flex-1 truncate">
                                            <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">No files attached.</p>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end border-t border-orange-200 p-4">
                    <button
                        onClick={onClose}
                        className="rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2 font-medium text-white shadow-md transition-all hover:from-orange-600 hover:to-red-600"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* --------- SMALL REUSABLE UI COMPONENTS -------- */

function Label({ children }: { children: React.ReactNode }) {
    return <span className="text-xs font-semibold text-orange-700 uppercase">{children}</span>;
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <Label>{label}</Label>
            <p className="mt-2 rounded-md border border-orange-200 bg-white p-3 text-gray-800">{value}</p>
        </div>
    );
}

function FieldWithIcon({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div>
            <Label>{label}</Label>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-orange-200 bg-white p-3">
                {icon}
                <span className="text-gray-800">{value}</span>
            </div>
        </div>
    );
}
