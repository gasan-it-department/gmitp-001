// PrintView.tsx
import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { PDFStructure } from "./PDFStructure";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AssistanceRequest } from '@/Core/Types/ActionCenter/AssistanceRequestTypes';
import { SplineIcon } from "lucide-react";

interface PrintViewProps {
    isOpen: boolean;
    data: AssistanceRequest | null;
    onClose: () => void;
}

export default function PrintView({ isOpen, onClose, data }: PrintViewProps) {
    const [locationNames, setLocationNames] = useState<{ provinceName: string; municipalityName: string; barangayName: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const BASE = "https://psgc.gitlab.io/api";

    // Fetch location names when dialog opens or data changes
    useEffect(() => {
        if (!data || !isOpen) return;

        const fetchLocations = async () => {
            setLoading(true);
            try {
                // Province
                const provinceRes = await fetch(`${BASE}/provinces/${data.beneficiary.province}/`);
                const provinceData = await provinceRes.json();

                // Municipality
                const muniRes = await fetch(`${BASE}/municipalities/${data.beneficiary.municipality}/`);
                const muniData = await muniRes.json();

                // Barangay
                const brgyRes = await fetch(`${BASE}/barangays/${data.beneficiary.barangay}/`);
                const brgyData = await brgyRes.json();

                setLocationNames({
                    provinceName: provinceData.name,
                    municipalityName: muniData.name,
                    barangayName: brgyData.name,
                });
            } catch (err) {
                console.error("Error fetching locations:", err);
                setLocationNames(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [data, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-6 rounded-2xl bg-white flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900">Preview PDF</DialogTitle>
                    <DialogDescription>
                        {loading ? "Loading location names..." : "Live PDF Preview: The content below shows how your document will look before download."}
                    </DialogDescription>
                </DialogHeader>

                <div
                    style={{
                        flexGrow: 1,
                        minHeight: 0,
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
                                <svg
                                    className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>
                            </div>
                            <span>Loading PDF preview...</span>
                        </div>
                    ) : data && locationNames ? (
                        <PDFViewer style={{ width: '100%', height: '100%' }}>
                            <PDFStructure data={data} locationNames={locationNames} />
                        </PDFViewer>
                    ) : (
                        <span className="text-red-500">Failed to load data.</span>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 shrink-0">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
