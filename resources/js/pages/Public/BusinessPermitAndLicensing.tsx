import { Button } from "@/components/ui/button";
import PublicLayout from "@/layouts/PublicLayoutTemplate";
import { useState } from "react";

export default function BusinessPermitAndLicensing() {
    const tabs = ["New Application", "Renewal", "Closure"];
    const [activeTab, setActiveTab] = useState("New Application");
    const [currentStepperView, setNewRegistrationStepperView] = useState(0);
    const [selectedBusinessType, setSelectedBusinessType] = useState("");
    let selectedTab = "new_registration";

    const renderView = () => {
        switch (currentStepperView) {
            case 0:
                return (
                    <div className="flex flex-col gap-4 w-full md:w-[900px]">
                        <p className="text-[14px]">
                            Please secure all necessary documents before proceeding with registration.
                        </p>

                        <div>
                            <p className="text-[14px] font-bold">1. Business Name Registration</p>
                            <p className="text-[13px]">
                                Sole Proprietor: DTI<br />
                                Corporations or Partnerships: SEC<br />
                                Cooperative: CDA
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">
                                2. Contract of Lease or Tax Declarations
                            </p>
                            <p className="text-[13px]">
                                Notes (if leased):<br />
                                * Contract of lease must include TCT/Property Description<br />
                                * Must be duly signed and notarized<br />
                                * Contains/Indicates valid identity of lessor and lessee
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">
                                3. Sketch and Photo of business location (if applicable)
                            </p>
                            <p className="text-[13px]">
                                * Please make sure that all photos are clearly visible.
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">4. ID of the owner</p>
                            <p className="text-[13px]">
                                * Please make sure that all photos are clearly visible.
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">Other requirements (may be required)</p>
                            <p className="text-[13px]">
                                You may contact the BPLO department to assess the nature of your business and inform you of the requirements.<br />
                                * Tax Incentives Certificates<br />
                                * Community Tax Certificate (Cedula)<br />
                                * BMBE Certificate of Authority from DTI<br />
                                * Letter of No Objections (LONO)<br />
                                * Gambling Regulatory Advisory Council Resolution (GRAC)<br />
                                * Special Permit / Fixed Term Special Permit<br />
                                * Market Certificate<br />
                                * Certificate of PEZA Accreditation<br />
                                * Certificate of Exemption from DOST<br />
                                * ID of Authorized Representative<br />
                                * Signed Authorization Form
                            </p>
                        </div>

                        <Button className="w-fit h-7 text-[12px] mt-4">
                            Download Requirements
                        </Button>
                    </div>
                );

            case 1:
                return (
                    <div className="flex flex-col gap-4 w-full md:w-[900px] px-2">
                        <a className="text-[16px] font-bold">
                            Business Information
                        </a>

                        <div className="space-y-2">
                            <label className="font-medium">Business Type</label>
                            <div className="flex flex-col space-y-1">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="sole_propeitor"
                                        value="sole_propeitor"
                                        checked={selectedBusinessType === "sole_propeitor"}
                                        onChange={(e) => setSelectedBusinessType(e.target.value)}
                                        className="accent-blue-600"
                                    />
                                    <span>Sole Propeitor</span>
                                </label>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="corporation_partnership"
                                        value="corporation_partnership"
                                        checked={selectedBusinessType === "corporation_partnership"}
                                        onChange={(e) => setSelectedBusinessType(e.target.value)}
                                        className="accent-blue-600"
                                    />
                                    <span>Corporations or Partnerships</span>
                                </label>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="cooperative"
                                        value="cooperative"
                                        checked={selectedBusinessType === "cooperative"}
                                        onChange={(e) => setSelectedBusinessType(e.target.value)}
                                        className="accent-blue-600"
                                    />
                                    <span>Cooperative</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    const renderContent = () => {
        const uploadDTIorSEC = (event: { target: { files: any[]; }; }) => {
            const file = event.target.files[0];
            if (file) {
                //setDtiSecFileName(file.name);
                console.log("Uploaded file:", file.name);
            }
        };

        const uploadLeaseOrTax = (event: { target: { files: any[]; }; }) => {
            const file = event.target.files[0];
            if (file) {
                //setLeaseTaxFileName(file.name);
                console.log("Uploaded file:", file.name);
            }
        };

        const uploadBarangayClearance = (event: { target: { files: any[]; }; }) => {
            const file = event.target.files[0];
            if (file) {
                //setBarangayClearanceFileName(file.name);
                console.log("Uploaded file:", file.name);
            }
        };

        switch (activeTab) {
            case "New Application":
                selectedTab = "new_registration";
                return (
                    <div className="w-full px-0 sm:px-0 lg:px-0">

                        <a className="block font-bold text-[20px] w-full text-center mb-6">
                            New Business Registration
                        </a>

                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full max-w-full overflow-x-auto gap-4 mt-6">
                            {[
                                { step: 1, label: "Requirements", active: currentStepperView >= 0 },
                                { step: 2, label: "Information", active: currentStepperView >= 1 },
                                { step: 3, label: "Operations", active: currentStepperView >= 2 },
                                { step: 4, label: "Other Information", active: currentStepperView >= 3 },
                                { step: 5, label: "Summary", active: currentStepperView >= 4 },

                            ].map((s, idx) => (
                                <div key={idx} className="flex flex-col items-center relative min-w-[70px] flex-1">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.active ? "bg-black text-white" : "bg-gray-300 text-gray-600"
                                            }`}
                                    >
                                        {s.step}
                                    </div>

                                    <span
                                        className={`mt-2 text-sm font-medium text-center ${s.active ? "text-black" : "text-gray-600"
                                            }`}
                                    >
                                        {s.label}
                                    </span>

                                    {idx < 4 && (
                                        <div className="absolute top-4 left-full w-full h-0.5 bg-gray-300 z-[-1] sm:block hidden"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 mb-6">
                            {renderView()}
                        </div>

                        <div className="flex justify-between flex-col sm:flex-row gap-4">
                            <Button
                                className={`w-full sm:w-auto ${currentStepperView == 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={currentStepperView == 0}
                                onClick={() => {
                                    if (currentStepperView != 0) setNewRegistrationStepperView(currentStepperView - 1);
                                }}
                            >Previous
                            </Button>

                            <Button
                                onClick={() => {
                                    if (currentStepperView != 4) setNewRegistrationStepperView(currentStepperView + 1);
                                }}
                                disabled={currentStepperView == 4}
                                className={`w-full sm:w-auto ${currentStepperView == 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Next
                            </Button>
                        </div>

                    </div>
                );

            case "Renewal":
                selectedTab = "renewal";
                return <div className="p-4">

                </div>;
            case "Closure":
                selectedTab = "closure";
                return <div className="p-4">This is the contact tab.</div>;
            default:
                return null;
        }
    };

    return (
        <PublicLayout title="Business Permit" description="">
            <div className="px-1 py-4 max-w-auto mx-auto">
                <h1 className="font-bold text-[18px] mb-4 ml-3">
                    Business Permit and Licensing
                </h1>

                <div className="flex space-x-2 mb-5 p-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-all duration-200 ${activeTab === tab
                                ? "border-black text-black"
                                : "border-transparent text-gray-600 hover:text-blue-500"
                                }`}
                            onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white p-5">
                    {renderContent()}
                </div>
            </div>
        </PublicLayout>

    );
}