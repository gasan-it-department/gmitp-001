import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CommunityReportData, CommunityReportFormData } from "@/Core/Types/CommunityReportPage/CommunityReportPageTypes";
import { MapPin, User, Phone, ImageIcon } from "lucide-react";
import Utility from "@/pages/Utility/Utility";

interface ViewCommunityReportsProps {
    isOpen: boolean;
    data: CommunityReportData | null;
    onClose: () => void;
}

export default function ViewCommunityReportDialog({ isOpen, data, onClose }: ViewCommunityReportsProps) {

    if (!data) return null;

    console.log("Attached files: ", data.files);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] w-full sm:max-w-2xl overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-white via-orange-50 to-rose-50 shadow-xl">

                {/* HEADER */}
                <DialogHeader className="border-b border-orange-200 pb-3 text-center">
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Community Report
                    </DialogTitle>

                    <p className="text-sm text-gray-500 mt-1">
                        {Utility().formatToReadableDate(new Date().toISOString())}
                    </p>
                </DialogHeader>

                {/* BODY */}
                <div className="custom-scrollbar max-h-[65vh] overflow-y-auto px-4 py-5 space-y-6">

                    {/* ISSUE TYPE */}
                    <Field label="Issue Type" value={data.type.toUpperCase()} />

                    {/* LOCATION */}
                    <div>
                        <Label>Location</Label>
                        <div className="mt-2 bg-white border border-orange-200 p-3 rounded-md flex items-start gap-3 relative">
                            <MapPin className="w-5 h-5 text-orange-600 mt-1" />
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{data.location}</p>

                                {(data.latitude && data.longitude) && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        ({data.latitude}, {data.longitude})
                                    </p>
                                )}
                            </div>

                            {/* GOOGLE MAP BUTTON */}
                            <button
                                disabled={!data.latitude || !data.longitude}
                                onClick={() => {
                                    const url = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
                                    window.open(url, "_blank");
                                }}
                                className={`
                px-3 py-1 text-xs font-medium rounded-md ml-auto
                transition-all shadow-sm
                ${data.latitude && data.longitude
                                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-pointer"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"}
            `}
                            >
                                View on Map
                            </button>
                        </div>
                    </div>

                    {/* REPORT DETAILS */}
                    <div>
                        <Label>Description</Label>
                        <div className="mt-2 bg-gray-50 border border-orange-200 rounded-md p-4 text-gray-800 whitespace-pre-wrap">
                            {data.description}
                        </div>
                    </div>

                    {/* SENDER */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FieldWithIcon
                            icon={<User className="w-4 h-4 text-orange-600" />}
                            label="Sender"
                            value={data.sender_name || "Anonymous"}
                        />

                        <FieldWithIcon
                            icon={<Phone className="w-4 h-4 text-orange-600" />}
                            label="Contact"
                            value={data.contact ? data.contact : "Not provided"}
                        />
                    </div>

                    {/* FILES */}
                    <div>
                        <Label>Attached Files</Label>

                        {data.files?.length > 0 ? (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.files.map((file, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white border border-orange-200 rounded-md">
                                        <ImageIcon className="w-5 h-5 text-orange-600" />
                                        <div className="flex-1 truncate">
                                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-2">No files attached.</p>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-orange-200 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-md hover:from-orange-600 hover:to-red-600 transition-all"
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
            <p className="mt-2 bg-white border border-orange-200 p-3 rounded-md text-gray-800">
                {value}
            </p>
        </div>
    );
}

function FieldWithIcon({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div>
            <Label>{label}</Label>
            <div className="mt-2 bg-white border border-orange-200 p-3 rounded-md flex items-center gap-2">
                {icon}
                <span className="text-gray-800">{value}</span>
            </div>
        </div>
    );
}
