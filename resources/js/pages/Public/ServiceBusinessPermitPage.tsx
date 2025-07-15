import PublicLayout from '@/layouts/PublicLayoutTemplate';
import { useState } from 'react';

export default function BusinessPermitAndLicensing() {
    const tabs = ['New Application', 'Renewal', 'Closure'];
    const [activeTab, setActiveTab] = useState('New Application');
    const [dtiSecFileName, setDtiSecFileName] = useState();
    const [leaseTaxFileName, setLeaseTaxFileName] = useState();
    const [barangayClearanceFileName, setBarangayClearanceFileName] = useState();
    let selectedTab = 'new_registration';

    const renderContent = () => {
        const uploadDTIorSEC = (event: { target: { files: any[] } }) => {
            const file = event.target.files[0];
            if (file) {
                setDtiSecFileName(file.name);
                console.log('Uploaded file:', file.name);
            }
        };

        const uploadLeaseOrTax = (event: { target: { files: any[] } }) => {
            const file = event.target.files[0];
            if (file) {
                setLeaseTaxFileName(file.name);
                console.log('Uploaded file:', file.name);
            }
        };

        const uploadBarangayClearance = (event: { target: { files: any[] } }) => {
            const file = event.target.files[0];
            if (file) {
                setBarangayClearanceFileName(file.name);
                console.log('Uploaded file:', file.name);
            }
        };
        switch (activeTab) {
            case 'New Application':
                selectedTab = 'new_registration';
                return (
                    <PublicLayout title="Business Permit" description="">
                        <div className="flex flex-col p-3">
                            <a className="text-[16px] font-bold">Business Information</a>

                            <a className="text-[12px]">Please make sure that all images are clearly visible.</a>

                            <div className="m-2 flex-col">
                                <p className="text-[12px]">DTI or SEC Registration (jpg/png/pdf 3Mb)</p>
                                <label className="mt-4 inline-flex cursor-pointer items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Upload File
                                    <input type="file" accept=".jpg,.png,.pdf" onChange={uploadDTIorSEC} className="hidden" />
                                </label>
                            </div>
                            <a className="p-1 text-[10px]">{dtiSecFileName}</a>

                            <div className="m-2 flex-col">
                                <p className="text-[12px]">Lease or Tax Declaration (jpg/png/pdf 3Mb)</p>
                                <label className="mt-4 inline-flex cursor-pointer items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Upload File
                                    <input type="file" accept=".jpg,.png,.pdf" onChange={uploadLeaseOrTax} className="hidden" />
                                </label>
                            </div>
                            <a className="p-1 text-[10px]">{leaseTaxFileName}</a>

                            <div className="m-2 flex-col">
                                <p className="text-[12px]">Barangay Clearance (jpg/png/pdf 3Mb)</p>
                                <label className="mt-4 inline-flex cursor-pointer items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Upload File
                                    <input type="file" accept=".jpg,.png,.pdf" onChange={uploadBarangayClearance} className="hidden" />
                                </label>
                            </div>
                            <a className="p-1 text-[10px]">{barangayClearanceFileName}</a>
                        </div>
                    </PublicLayout>
                );
            case 'Renewal':
                selectedTab = 'renewal';
                return <div className="p-4">This is the services tab.</div>;
            case 'Closure':
                selectedTab = 'closure';
                return <div className="p-4">This is the contact tab.</div>;
            default:
                return null;
        }
    };

    return (
        <PublicLayout title="Business Permit" description="">
            <div className="p-3">
                <a className="p-3 text-[18px] font-bold">Business Permit and Licensing</a>

                <div className="mx-auto max-w-xl p-4">
                    <div className="mb-4 flex space-x-2 border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                className={`border-b-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                    activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-blue-500'
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow">{renderContent()}</div>
                </div>
            </div>
        </PublicLayout>
    );
}
