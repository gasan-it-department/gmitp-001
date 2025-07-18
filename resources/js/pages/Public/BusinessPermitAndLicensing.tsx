import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/layouts/PublicLayoutTemplate";
import { SetStateAction, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function BusinessPermitAndLicensing() {
    const tabs = ["New Application", "Renewal", "Closure"];
    const [activeTab, setActiveTab] = useState("New Application");
    const [currentStepperView, setNewRegistrationStepperView] = useState(0);
    const [selectedBusinessType, setSelectedBusinessType] = useState("");
    let selectedTab = "new_registration";
    const [barangayBusinessClearance, setBarangayBusinessClearance] = useState("");
    const [recidenceCertificate, setRecidenceCertificate] = useState("");
    const [dtiSecCdaCertificate, setDtiSecCdaCertificate] = useState("");
    const [zoningClearance, setZoningClearanceCertifiicate] = useState("");
    const [engineeringClearanceCertificate, setEngineeringClearanceCertificate] = useState("");
    const [sanitaryClearanceCertificate, setSanitaryClearanceCertificate] = useState("");
    const [policeClearanceCertificate, setPoliceClearanceCertificate] = useState("");
    const [governmentIncentiveCertificates, setGovernmentIncentivedCertificates] = useState("");
    const [text, setText] = useState("");

    const handleBarangayBusinessClearance = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBarangayBusinessClearance(file.name);
        }
    };

    const handleRecidenceCertiificate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRecidenceCertificate(file.name);
        }
    };

    const handleDtiSecCdaCertificate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDtiSecCdaCertificate(file.name);
        }
    };

    const handleZoningCertificateClearance = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setZoningClearanceCertifiicate(file.name);
        }
    };

    const handleEngineeringClearanceCertificate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEngineeringClearanceCertificate(file.name);
        }
    };

    const handleSanitaryClearanceCertificate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSanitaryClearanceCertificate(file.name);
        }
    };

    const handlePoliceClearanceCertificate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPoliceClearanceCertificate(file.name);
        }
    };

    const handleIncentivesCertificates = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setGovernmentIncentivedCertificates(file.name);
        }
    };

    const renderView = () => {
        switch (currentStepperView) {
            case 0:
                return (
                    <div className="flex flex-col gap-4 w-full md:w-[900px]">
                        <p className="text-[14px]">
                            Please secure all necessary documents before proceeding with registration.
                        </p>

                        <div>
                            <p className="text-[14px] font-bold">1. Brgy. Business Clearance</p>
                            <p className="text-[13px]">
                                Place of business/Particular Barangay
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">
                                2. Residence Certificate (Cedula)
                            </p>
                            <p className="text-[13px]">
                                Brgy. Residence/Municipality
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">
                                3. DTI/SEC/CDA
                            </p>
                            <p className="text-[13px]">
                                Particular National Agency
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">4. Zoning Clearance</p>
                            <p className="text-[13px]">
                                MPDO Office, 2nd floor, Municipal Building
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">5. Engineering Clearance</p>
                            <p className="text-[13px]">
                                Engineering Office 2nd floor, Municipal Building
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">6. Sanitary Clearance</p>
                            <p className="text-[13px]">
                                RHU Center
                            </p>
                        </div>

                        <div>
                            <p className="text-[14px] font-bold">7. Police Clearance</p>
                            <p className="text-[13px]">
                                PNP Police Station
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
                        <div className="space-y-2">
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <p className="font-bold">
                                    1. Business Clearance <span className="text-sm">(pdf, docx, doc, jpg, png)</span>
                                </p>

                                {barangayBusinessClearance && (
                                    <span className="text-sm text-gray-600 truncate">
                                        File: {barangayBusinessClearance}
                                    </span>
                                )}

                                <input
                                    id="barangayClearanceUploadButton"
                                    type="file"
                                    onChange={handleBarangayBusinessClearance}
                                    className="hidden"
                                />

                                <Button
                                    type="button"
                                    className="w-fit"
                                    onClick={() => document.getElementById("barangayClearanceUploadButton")?.click()}
                                >
                                    Upload File
                                </Button>
                            </div>

                            <div className="mt-8 mb-8" />

                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <p className="font-bold">
                                    2. Recidence Certificate (Cedula) <span className="text-sm">(pdf, docx, doc, jpg, png)</span>
                                </p>

                                {recidenceCertificate && (
                                    <span className="text-sm text-gray-600 truncate">
                                        File: {recidenceCertificate}
                                    </span>
                                )}

                                <input
                                    id="recidenceCertificateUploadButton"
                                    type="file"
                                    onChange={handleRecidenceCertiificate}
                                    className="hidden"
                                />

                                <Button
                                    type="button"
                                    className="w-fit"
                                    onClick={() => document.getElementById("recidenceCertificateUploadButton")?.click()}
                                >
                                    Upload File
                                </Button>
                            </div>

                            <div className="mt-8 mb-8" />

                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <p className="font-bold">
                                    3. DTI/SEC or CDA <span className="text-sm">(pdf, docx, doc, jpg, png)</span>
                                </p>

                                {dtiSecCdaCertificate && (
                                    <span className="text-sm text-gray-600 truncate">
                                        File: {dtiSecCdaCertificate}
                                    </span>
                                )}

                                <input
                                    id="dtiSecCdaCetificateUploadButton"
                                    type="file"
                                    onChange={handleDtiSecCdaCertificate}
                                    className="hidden"
                                />

                                <Button
                                    type="button"
                                    className="w-fit"
                                    onClick={() => document.getElementById("dtiSecCdaCetificateUploadButton")?.click()}
                                >
                                    Upload File
                                </Button>
                            </div>

                            <div className="mt-8 mb-8" />

                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <p className="font-bold">
                                    4. Zoning Clearance <span className="text-sm">(pdf, docx, doc, jpg, png)</span>
                                </p>

                                {zoningClearance && (
                                    <span className="text-sm text-gray-600 truncate">
                                        File: {zoningClearance}
                                    </span>
                                )}

                                <input
                                    id="zoningCertificateClearanceUploadButton"
                                    type="file"
                                    onChange={handleZoningCertificateClearance}
                                    className="hidden"
                                />

                                <Button
                                    type="button"
                                    className="w-fit"
                                    onClick={() => document.getElementById("zoningCertificateClearanceUploadButton")?.click()}
                                >
                                    Upload File
                                </Button>
                            </div>

                            <div className="mt-8 mb-8" />

                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <p className="font-bold">
                                    5. Engineering Clearance <span className="text-sm">(pdf, docx, doc, jpg, png)</span>
                                </p>

                                {engineeringClearanceCertificate && (
                                    <span className="text-sm text-gray-600 truncate">
                                        File: {engineeringClearanceCertificate}
                                    </span>
                                )}

                                <input
                                    id="engineeringClearanceCertificateUploadButton"
                                    type="file"
                                    onChange={handleEngineeringClearanceCertificate}
                                    className="hidden"
                                />

                                <Button
                                    type="button"
                                    className="w-fit"
                                    onClick={() => document.getElementById("engineeringClearanceCertificateUploadButton")?.click()}
                                >
                                    Upload File
                                </Button>
                            </div>

                            <div className="mt-8 mb-8" />

                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <p className="font-bold">
                                    6. Sanitary Clearance <span className="text-sm">(pdf, docx, doc, jpg, png)</span>
                                </p>

                                {sanitaryClearanceCertificate && (
                                    <span className="text-sm text-gray-600 truncate">
                                        File: {sanitaryClearanceCertificate}
                                    </span>
                                )}

                                <input
                                    id="sanitaryClearanceCertificateUploadButton"
                                    type="file"
                                    onChange={handleSanitaryClearanceCertificate}
                                    className="hidden"
                                />

                                <Button
                                    type="button"
                                    className="w-fit"
                                    onClick={() => document.getElementById("sanitaryClearanceCertificateUploadButton")?.click()}
                                >
                                    Upload File
                                </Button>
                            </div>

                            <div className="mt-8 mb-8" />

                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <p className="font-bold">
                                    7. Police Clearance <span className="text-sm">(pdf, docx, doc, jpg, png)</span>
                                </p>

                                {policeClearanceCertificate && (
                                    <span className="text-sm text-gray-600 truncate">
                                        File: {policeClearanceCertificate}
                                    </span>
                                )}

                                <input
                                    id="policeClearanceCertificateUploadButton"
                                    type="file"
                                    onChange={handlePoliceClearanceCertificate}
                                    className="hidden"
                                />

                                <Button
                                    type="button"
                                    className="w-fit"
                                    onClick={() => document.getElementById("policeClearanceCertificateUploadButton")?.click()}
                                >
                                    Upload File
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="flex flex-col gap-4 w-full md:w-[900px] px-2">
                        <a className="font-bold">A. BUSINESS INFORMATION AND REGISTRATION</a>
                        <RadioGroup defaultValue="sole" className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-wrap">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Sole Propeitorship" id="sole_propeitorship" />
                                <label htmlFor="sole_propeitorship" className="cursor-pointer text-sm md:text-base">
                                    Sole Proprietorship
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Partnership" id="partnership" />
                                <label htmlFor="partnership" className="cursor-pointer text-sm md:text-base">
                                    Partnership
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Corporation" id="corporation" />
                                <label htmlFor="corporation" className="cursor-pointer text-sm md:text-base">
                                    Corporation
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Cooperative" id="cooperative" />
                                <label htmlFor="cooperative" className="cursor-pointer text-sm md:text-base">
                                    Cooperative
                                </label>
                            </div>
                        </RadioGroup>
                        <div className="w-full">
                            <p className="text-[10px] text-gray-600 mb-2">
                                (For sole proprietor, Name of the owner) (For Corporation/Cooperative/Partnership, Name of President/Officer in charge)
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="surname" className="block mb-1 text-sm font-medium text-gray-700">
                                        Surname
                                    </label>
                                    <Input
                                        id="surname"
                                        value={text}
                                        type="text"
                                        placeholder="Surname"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="givenName" className="block mb-1 text-sm font-medium text-gray-700">
                                        Given Name
                                    </label>
                                    <Input
                                        id="givenName"
                                        value={text}
                                        type="text"
                                        placeholder="Given Name"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="middleName" className="block mb-1 text-sm font-medium text-gray-700">
                                        Middle Name
                                    </label>
                                    <Input
                                        id="middleName"
                                        value={text}
                                        type="text"
                                        placeholder="Middle Name"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="suffix" className="block mb-1 text-sm font-medium text-gray-700">
                                        Suffix (if any)
                                    </label>
                                    <Input
                                        id="suffix"
                                        value={text}
                                        type="text"
                                        placeholder="Suffix"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="birthdate" className="block mb-1 text-sm font-medium text-gray-700">
                                        Birthdate
                                    </label>
                                    <Input
                                        id="birthdate"

                                        type="date"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="birthplace" className="block mb-1 text-sm font-medium text-gray-700">
                                        Birthplace
                                    </label>
                                    <Input
                                        id="birthplace"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <div className="flex space-x-4">
                                        <RadioGroup defaultValue="sole" className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-wrap">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Male" id="gener_male" />
                                                <label htmlFor="gener_male" className="cursor-pointer text-sm md:text-base">
                                                    Male
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Female" id="gender_female" />
                                                <label htmlFor="gender_female" className="cursor-pointer text-sm md:text-base">
                                                    Female
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">For Corporation</label>
                                    <div className="flex space-x-4">
                                        <RadioGroup defaultValue="sole" className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-wrap">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="sole" id="corporate_filipino" />
                                                <label htmlFor="corporate_filipino" className="cursor-pointer text-sm md:text-base">
                                                    Filipino
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="partnership" id="corporate_foreign" />
                                                <label htmlFor="corporate_foreign" className="cursor-pointer text-sm md:text-base">
                                                    Foreign
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                                    <div className="flex space-x-4">
                                        <RadioGroup defaultValue="sole" className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-wrap">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Single" id="civil_single" />
                                                <label htmlFor="civil_single" className="cursor-pointer text-sm md:text-base">
                                                    Single
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Married" id="civil_married" />
                                                <label htmlFor="civil_married" className="cursor-pointer text-sm md:text-base">
                                                    Married
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Widow" id="civil_widow" />
                                                <label htmlFor="civil_widow" className="cursor-pointer text-sm md:text-base">
                                                    Widow
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Separated" id="civil_separated" />
                                                <label htmlFor="civil_separated" className="cursor-pointer text-sm md:text-base">
                                                    Separated
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="home_address" className="block mb-1 text-sm font-medium text-gray-700">
                                        Home Address
                                    </label>
                                    <Input
                                        id="home_address"
                                        type="text"
                                        placeholder="House/Bldg. No., Street, Barangay, City/Municipality, Province, Zip Code"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="telephone_number" className="block mb-1 text-sm font-medium text-gray-700">
                                        Telephone Number
                                    </label>
                                    <Input
                                        id="telephone_number"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="mobile_number" className="block mb-1 text-sm font-medium text-gray-700">
                                        Mobile Number
                                    </label>
                                    <Input
                                        id="mobile_number"

                                        type="text"
                                        placeholder="09"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email_address" className="block mb-1 text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <Input
                                        id="email_address"

                                        type="text"
                                        placeholder="example@gmail.com"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="dti_sec_cda_registration_number" className="block mb-1 text-sm font-medium text-gray-700">
                                        DTI / SEC / CDA Registration Number
                                    </label>
                                    <Input
                                        id="dti_sec_cda_registration_number"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="tax_identification_number" className="block mb-1 text-sm font-medium text-gray-700">
                                        Tax Identification Number (TIN)
                                    </label>
                                    <Input
                                        id="tax_identification_number"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="business_name" className="block mb-1 text-sm font-medium text-gray-700">
                                        Business Name
                                    </label>
                                    <Input
                                        id="business_name"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="trade_name" className="block mb-1 text-sm font-medium text-gray-700">
                                        Trade Name / Franchise (if applicable)
                                    </label>
                                    <Input
                                        id="trade_name"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 mb-8" />

                            <a className="font-bold">B. BUSINESS OPERATION</a>

                            <div className="mt-5 mb-5" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="business_area" className="block mb-1 text-sm font-medium text-gray-700">
                                        Business Area (in sq.m)
                                    </label>
                                    <Input
                                        id="business_area"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="total_floor_area" className="block mb-1 text-sm font-medium text-gray-700">
                                        Total Floor Area (in sq.m)
                                    </label>
                                    <Input
                                        id="total_floor_area"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="operation_time" className="block mb-1 text-sm font-medium text-gray-700">
                                        Time of Operation
                                    </label>
                                    <Input
                                        id="operation_time"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <div>
                                        <label htmlFor="total_number_employee" className="block mb-1 text-sm font-medium text-gray-700">
                                            Total No. of Employees in Establishment
                                        </label>
                                        <Input
                                            id="total_number_employee"

                                            type="text"
                                            placeholder=""
                                            className="w-full border border-gray-300 p-2 rounded text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="number_employee_males" className="block mb-1 text-sm font-medium text-gray-700">
                                            Males
                                        </label>
                                        <Input
                                            id="number_employee_males"

                                            type="text"
                                            placeholder=""
                                            className="w-full border border-gray-300 p-2 rounded text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="number_employee_female" className="block mb-1 text-sm font-medium text-gray-700">
                                            Females
                                        </label>
                                        <Input
                                            id="number_employee_female"

                                            type="text"
                                            placeholder=""
                                            className="w-full border border-gray-300 p-2 rounded text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="number_employee_in_gasan" className="block mb-1 text-sm font-medium text-gray-700">
                                        No. of Employees Residing within Gasan
                                    </label>
                                    <Input
                                        id="number_employee_in_gasan"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        No. of Delivery Vehicles (if applicable)
                                    </label>
                                    <div className="mt-3 mb-3" />
                                    <div>
                                        <label htmlFor="vehicle_van_truck_numbers" className="block mb-1 text-sm font-medium text-gray-700">
                                            Van/Trucks
                                        </label>

                                        <div className="mt-2 mb-2" />

                                        <Input
                                            id="vehicle_van_truck_numbers"

                                            type="text"
                                            placeholder=""
                                            className="w-full border border-gray-300 p-2 rounded text-sm"
                                        />
                                    </div>

                                    <div className="mt-2 mb-2" />

                                    <div>
                                        <label htmlFor="vehicle_motorcycle_numbers" className="block mb-1 text-sm font-medium text-gray-700">
                                            Motorcycles
                                        </label>
                                        <Input
                                            id="vehicle_motorcycle_numbers"

                                            type="text"
                                            placeholder=""
                                            className="w-full border border-gray-300 p-2 rounded text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="same_as_home_address"
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="same_as_home_address" className="text-sm text-gray-700">
                                            Same as Home Address
                                        </label>
                                    </div>

                                    <div className="mt-2 mb-2" />

                                    <label htmlFor="business_location" className="block mb-1 text-sm font-medium text-gray-700">
                                        Business Location
                                    </label>
                                    <Input
                                        id="business_location"

                                        type="text"
                                        placeholder="House/Bldg. No., Street, Barangay, City/Municipality, Province, Zip Code"
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-3 mb-3" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Owned?</label>
                                    <div className="flex space-x-4">
                                        <RadioGroup defaultValue="sole" className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-wrap">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Owned" id="owned_yes" />
                                                <label htmlFor="owned_yes" className="cursor-pointer text-sm md:text-base">
                                                    Yes
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Not Owned" id="owned_no" />
                                                <label htmlFor="owned_no" className="cursor-pointer text-sm md:text-base">
                                                    No
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="owned_tax_declaration_pros_identification" className="block mb-1 text-sm font-medium text-gray-700">
                                        If owned, Tax Declaration No. or Property Identification No.
                                    </label>
                                    <Input
                                        id="owned_tax_declaration_pros_identification"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="renting_lessor_name" className="block mb-1 text-sm font-medium text-gray-700">
                                        If RENTING: Name of Lessor
                                    </label>
                                    <Input
                                        id="renting_lessor_name"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="total_capital" className="block mb-1 text-sm font-medium text-gray-700">
                                        Total Capital Investment (Paid up capital + Lease Expenses + Equipment)
                                    </label>
                                    <Input
                                        id="total_capital"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="amount_monthly_rental" className="block mb-1 text-sm font-medium text-gray-700">
                                        Amount of MONTHLY RENTAL
                                    </label>
                                    <Input
                                        id="amount_monthly_rental"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Do you have tax incentives from any Government Entity?</label>
                                    <a className="text-[12px]">If YES, please upload a copy (pdf, png, jpg)</a>
                                    <div className="flex space-x-4">
                                        <RadioGroup defaultValue="sole" className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-wrap">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Yes" id="tax_incentives_yes" />
                                                <label htmlFor="tax_incentives_yes" className="cursor-pointer text-sm md:text-base">
                                                    Yes
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="No" id="tax_incentived_no" />
                                                <label htmlFor="tax_incentived_no" className="cursor-pointer text-sm md:text-base">
                                                    No
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="mt-3 mb-3" />

                                    <div className="flex flex-col">
                                        {governmentIncentiveCertificates && (
                                            <span className="text-sm text-gray-600 truncate">
                                                File: {governmentIncentiveCertificates}
                                            </span>
                                        )}

                                        <div className="mt-1 mb-1"/>

                                        <input
                                            id="governmentIncentiveCertificatesUploadButton"
                                            type="file"
                                            onChange={handleIncentivesCertificates}
                                            className="hidden"
                                        />

                                        <Button
                                            type="button"
                                            disabled={false}
                                            className="w-20 h-6 text-[10px]"
                                            onClick={() => document.getElementById("governmentIncentiveCertificatesUploadButton")?.click()}
                                        >
                                            Upload File
                                        </Button>
                                    </div>


                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Activity</label>
                                    <div className="flex space-x-4">
                                        <RadioGroup defaultValue="sole" className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-wrap">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Main Office" id="business_activity_main_office" />
                                                <label htmlFor="business_activity_main_office" className="cursor-pointer text-sm md:text-base">
                                                    Main Office
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Branch Office" id="business_activity_branch_office" />
                                                <label htmlFor="business_activity_branch_office" className="cursor-pointer text-sm md:text-base">
                                                    Branch Office
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Admin Office" id="business_activity_admin_office" />
                                                <label htmlFor="business_activity_admin_office" className="cursor-pointer text-sm md:text-base">
                                                    Admin Office
                                                </label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Warehouse" id="business_activity_warehouse" />
                                                <label htmlFor="business_activity_warehouse" className="cursor-pointer text-sm md:text-base">
                                                    Warehouse
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="business_activity_others" className="block mb-1 text-sm font-medium text-gray-700">
                                        Others, please specify
                                    </label>
                                    <Input
                                        id="business_activity_others"

                                        type="text"
                                        placeholder=""
                                        className="w-full border border-gray-300 p-2 rounded text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }

    };

    const renderContent = () => {

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
                                { step: 2, label: "Documents", active: currentStepperView >= 1 },
                                { step: 3, label: "Application", active: currentStepperView >= 2 },
                                { step: 4, label: "Confirmation", active: currentStepperView >= 3 },

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
                                    if (currentStepperView != 3) {
                                        setNewRegistrationStepperView(currentStepperView + 1);
                                    } else {

                                    }
                                }}
                                className={`w-full sm:w-auto ${currentStepperView == 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {currentStepperView == 3 ? "Submit" : "Next"}
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