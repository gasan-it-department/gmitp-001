import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/layouts/PublicLayoutTemplate";
import { ChangeEvent, SetStateAction, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import RequirementsView from "./RequirementsView";
import UploadDocuments from "./UploadDocuments";
import { Download, Upload } from "lucide-react";

export default function BusinessPermitAndLicensing() {
    const [uploadedFiles, setUploadedFiles] = useState<Record<number, string | null>>({});

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files && e.target.files[0];
        setUploadedFiles(prev => ({
            ...prev,
            [index]: file?.name || null,
        }));
    };

    const businessPermitDetails = [
        {
            title: "Zoning Clearance",
            instruction: "Get it at 2nd Floor",
            fileUrl: "https://example.com/zoning-clearance-form.pdf",
            downloadable: true,
            applicationRequired: false,
        },
        {
            title: "RHU Certificate",
            instruction: "Obtain from Rural Health Unit",
            fileUrl: "https://example.com/rhu-certificate-form.pdf",
            downloadable: true,
            applicationRequired: true,
        },
        {
            title: "Fire Safety Inspection Certificate",
            instruction: "Get it from Bureau of Fire Protection",
            fileUrl: "https://example.com/fire-safety-form.pdf",
            downloadable: true,
            applicationRequired: true,
        },
        {
            title: "Sanitary Permit",
            instruction: "Obtain from Health Office",
            fileUrl: "https://example.com/sanitary-permit-form.pdf",
            downloadable: true,
            applicationRequired: true,
        },
        {
            title: "Barangay Clearance",
            instruction: "Secure it from your barangay hall",
            fileUrl: "https://example.com/barangay-clearance-form.pdf",
            downloadable: false,
            applicationRequired: true,
        },
    ];

    return (
        <PublicLayout title="Business Permit" description="">
            <div className="px-4 py-4 max-w-5xl mx-auto">
                <h1 className="font-bold text-[20px] mb-4 ml-3">
                    Business Permit and Licensing
                </h1>
                <div className="bg-white p-5 rounded shadow-sm">
                    <ul className="space-y-6">
                        {businessPermitDetails.map((detail, index) => (
                            <li key={index} className="border-b pb-4">
                                <p className="font-bold">{index + 1}. {detail.title}</p>
                                <p className="text-sm text-gray-600 mb-2">{detail.instruction}</p>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    {detail.downloadable && (
                                        <a
                                            href={detail.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm w-fit"
                                        >
                                            Download Form
                                        </a>
                                    )}

                                    <label className="cursor-pointer px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm w-fit">
                                        Upload Document
                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) => handleFileChange(e, index)}
                                        />
                                    </label>
                                </div>

                                {uploadedFiles[index] && (
                                    <span className="text-[12px] text-gray-700">
                                        File: {uploadedFiles[index]}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </PublicLayout>
    );
}