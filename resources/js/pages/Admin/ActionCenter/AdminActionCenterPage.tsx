import { useEffect, useState } from 'react';
import { Home, LogsIcon, LogOut, ArrowLeftRight } from 'lucide-react';
import AddNewRecordDialog from './Components/AddEditRecordDialog';
import SortSelectionDialog from './Components/SortSelectionDialog';
import Dashboard from './Components/Dashboard';
import ActivityLog from './Components/ActivityLog';
import Utility from '@/pages/Utility/Utility';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import Header from './Components/Header';
import AddEditRecordDialog from './Components/AddEditRecordDialog';

interface ClientData {
    firstName: string;
    lastName: string;
    middleName?: string;
    contactNumber: string;
    service: string;
    transactionNumber: string;
    dateApproved: string;
    description: string;
    province: string;
    municipality: string;
    barangay: string;
}

interface LogsData {
    title: string;
    description: string;
    date: string;
}

export default function AdminActionCenterPage() {
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState(false);
    const [isSortSelectionDialogOpen, setIsSortSelectionDialogOpen] = useState(false);
    const [loadedRequestData, setLoadedRequestData] = useState<ClientData[]>([]);
    const [filteringHolder, setFilteringHolder] = useState<any[]>([]);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [activityLogsList, setActivityLogsList] = useState<LogsData[]>([]);
    const [currentSelectedSortOption, setCurrentSelectedSortOption] = useState("");
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMessage, setDialogMessage] = useState("");
    const [isClassicDialogShowing, setIsClassicDialogShowing] = useState(false);
    const [editData, setEditData] = useState<ClientData | null>(null);

    const menuItems = [
        { label: "Dashboard", icon: <Home className="w-5 h-5" />, },
        { label: "Activity Logs", icon: <LogsIcon className="w-5 h-5" />, },
        { label: "Transfers", icon: <ArrowLeftRight size={20} /> },
        { label: "Logout", icon: <LogOut className="w-5 h-5 text-red-400" />, },
    ];

    useEffect(() => {
        const dummy = [
            { firstName: "Analiza", lastName: "Otong", middleName: "Middle", contactNumber: "09953450732", service: "Financial", transactionNumber: "SF45GT4TW", dateApproved: "175585334", description: "Lorem ipsum dolor sit amet.", province: "Marinduque", municipality: "Gasan", barangay: "Bahi" }
        ];

        const logsData = [
            { title: "New Record", description: "You have added new records", date: "1755824280" },
            { title: "New Record", description: "You have added new records", date: "1755824256" },
        ];

        setLoadedRequestData(dummy);
        setActivityLogsList(logsData);
        setFilteringHolder(dummy);
    }, []);

    async function sortList(sortOption: string) {
        console.log(`Selected option: ${sortOption}`);
        switch (sortOption) {
            case "sort_status":
                const sortedByStatus = [...filteringHolder].sort((a, b) => {
                    const isEligibleA = Utility().calculateTotalDays(a.dateApproved) >= 92;
                    const isEligibleB = Utility().calculateTotalDays(b.dateApproved) >= 92;
                    if (isEligibleA && !isEligibleB) return -1;
                    if (!isEligibleA && isEligibleB) return 1;
                    return a.name.localeCompare(b.name);
                });
                setFilteringHolder(sortedByStatus);
                break;

            case "sort_due_date":
                const sortByDueDate = [...filteringHolder].sort((a, b) => {
                    const timeA = parseInt(a.dateApproved || "0", 10) + (160 * 24 * 60 * 60);
                    const timeB = parseInt(b.dateApproved || "0", 10) + (160 * 24 * 60 * 60);
                    return timeA - timeB;
                });

                setFilteringHolder(sortByDueDate);
                break;

            case "sort_transaction_id":
                const sortByTransactionId = [...filteringHolder].sort((a, b) =>
                    (a.transactionNumber || "").localeCompare(b.transactionNumber || "")
                );
                setFilteringHolder(sortByTransactionId);
                break;

            case "sort_title":
                const sortByTitle = [...filteringHolder].sort((a, b) =>
                    (a.title || "").localeCompare(b.title || "")
                );
                setFilteringHolder(sortByTitle);
                break;
            case "sort_request_date": {
                const sortByDate = [...filteringHolder].sort((a, b) => {
                    const timeA = a.dateApproved ? parseInt(a.dateApproved, 10) : 0;
                    const timeB = b.dateApproved ? parseInt(b.dateApproved, 10) : 0;
                    return timeB - timeA; // newest first
                });
                setFilteringHolder(sortByDate);
                break;
            }

            case "sort_name": {
                const sortByName = [...filteringHolder].sort((a, b) =>
                    (a.name || "").localeCompare(b.name || "")
                );
                setFilteringHolder(sortByName);
                break;
            }
        }

        setIsSortSelectionDialogOpen(false);
    }

    return (
        <div className="flex">
            <div className={`bg-primary text-white h-screen transition-all duration-300 w-64 shadow-lg`}>
                <div className="flex items-center justify-between px-4 py-3">
                    <span className={`text-lg font-semibold transition-opacity duration-300 opacity-100`}>Action Center Admin</span>
                </div>
                <ul className="mt-6 space-y-2">
                    {menuItems.map((item) => (
                        <li
                            key={item.label}
                            onClick={() => {
                                switch (item.label) {
                                    case "Logout":
                                        setDialogTitle("Logout?");
                                        setDialogMessage("Are you sure you want to logout?");
                                        setIsClassicDialogShowing(true);
                                        break;
                                    case "Transfers":
                                        setFilteringHolder(loadedRequestData);
                                        setActiveItem(item.label);
                                        break;
                                    case "Dashboard":
                                        setFilteringHolder(loadedRequestData);
                                        setActiveItem(item.label);
                                        break;
                                    case "Activity Logs":
                                        setFilteringHolder(activityLogsList);
                                        setActiveItem(item.label);
                                        break;
                                }
                            }}
                            className={`flex items-center gap-3 p-2 mr-3 ml-3 rounded-lg cursor-pointer transition-colors ${activeItem === item.label
                                ? "bg-gray-700 text-white font-medium"
                                : "hover:bg-gray-800 hover:text-white"}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-4">
                <div className="flex flex-row justify-between items-center gap-2">
                    {
                        activeItem === "Dashboard" && (
                            <div>
                                <h2 className="text-2xl font-semibold">Dashboard</h2>
                                <h1 className="text-[14px]">All Records ({filteringHolder.length})</h1>
                            </div>
                        )
                    }

                    {
                        activeItem === "Activity Logs" && (
                            <div>
                                <h2 className="text-2xl font-semibold">Activity Logs</h2>
                                <h1 className="text-[14px]">All Logs ({filteringHolder.length})</h1>
                            </div>
                        )
                    }

                    {
                        activeItem === "Transfers" && (
                            <div>
                                <h2 className="text-2xl font-semibold">Transfers</h2>
                                <h1 className="text-[14px]">Total transferred ({filteringHolder.length})</h1>
                            </div>
                        )
                    }

                    <Header activeItem={activeItem}
                        onFilterButtonClicked={() => {
                            setIsSortSelectionDialogOpen(true);
                        }} onAddNewButtonClicked={() => {
                            setEditData(null);
                            setIsAddNewRecordDialogOpen(true);
                        }} onExportButtonClicked={() => {
                            console.log("Export button clicked.");
                        }} onSearch={(value) => {
                            console.log(`Search for ${value}`);
                        }} />
                </div>

                <div className='mt-5 mb-5' />

                <div className="w-full">
                    {
                        activeItem === "Dashboard" && (
                            <Dashboard
                                data={filteringHolder}
                                onViewDetailsEditButtonClicked={(editData) => {
                                    setEditData(editData ?? null);
                                    setIsAddNewRecordDialogOpen(true);
                                }}
                                onViewDetialsDeleteButtonClicked={() => {

                                }} />
                        )
                    }

                    {
                        activeItem === "Activity Logs" && (
                            <ActivityLog data={filteringHolder} />
                        )
                    }

                    <AddEditRecordDialog
                        editData={editData}
                        isOpen={isAddNewRecordDialogOpen}
                        onClose={() => setIsAddNewRecordDialogOpen(false)} />

                    <SortSelectionDialog
                        currentSelected={currentSelectedSortOption}
                        selectedSortOption={(selectedSortOption) => {
                            sortList(selectedSortOption);
                            setCurrentSelectedSortOption(selectedSortOption);
                        }}
                        isOpen={isSortSelectionDialogOpen}
                        onClose={() => setIsSortSelectionDialogOpen(false)} />

                    <ClassicDialog
                        title={dialogTitle}
                        message={dialogMessage}
                        negativeButtonText='Cancel'
                        positiveButtonText='Logout'
                        onNegativeClick={() => {
                            setIsClassicDialogShowing(false);
                        }}
                        onPositiveClick={() => {
                            setIsClassicDialogShowing(false);
                        }}
                        open={isClassicDialogShowing}
                        hideNegativeButton={false}
                    />
                </div>
            </div>
        </div>
    );
}