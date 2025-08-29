import { useEffect, useState } from 'react';
import { Home, Settings, Plus, SortAscIcon, LogsIcon, LogOut, ArrowLeftRight, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '@/pages/Utility/SearchBar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AddNewRecordDialog from './Components/AddNewRecordDialog';
import SortSelectionDialog from './Components/SortSelectionDialog';
import Dashboard from './Components/Dashboard';
import ActivityLog from './Components/ActivityLog';

interface RequestData {
    name: string,
    title: string;
    status: string;
    dateApproved: string;
    transactionNumber: string;
}

interface LogsData {
    title: string;
    description: string;
    date: string;
}

export default function AdminActionCenterPage() {
    const [isAddNewRecordDialogOpen, setIsAddNewRecordDialogOpen] = useState(false);
    const [isSortSelectionDialogOpen, setIsSortSelectionDialogOpen] = useState(false);
    const [loadedRequestData, setLoadedRequestData] = useState<RequestData[]>([]);
    const [filteringHolder, setFilteringHolder] = useState<any[]>([]);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [activityLogsList, setActivityLogsList] = useState<LogsData[]>([]);

    const menuItems = [
        { label: "Dashboard", icon: <Home className="w-5 h-5" />, },
        { label: "Activity Logs", icon: <LogsIcon className="w-5 h-5" />, },
        { label: "Settings", icon: <Settings className="w-5 h-5" />, },
        { label: "Transfers", icon: <ArrowLeftRight size={20} /> },
        { label: "Logout", icon: <LogOut className="w-5 h-5 text-red-400" />, },
    ];

    useEffect(() => {
        const dummy = [
            { name: "Analiza", title: "Financial", status: "Pending", transactionNumber: "SF45GT4TW", dateApproved: "" },
            { name: "Alona", title: "Financial", status: "Active", transactionNumber: "SFSF45RG", dateApproved: "1755824280" },
            { name: "Paze", title: "Food Assistance", status: "Active", transactionNumber: "75H6RTH6H", dateApproved: "1755824280" },
            { name: "Geric", title: "Financial", status: "Expired", transactionNumber: "TYJJYL675", dateApproved: "1755824280" },
            { name: "Gondolf", title: "Ambulance", status: "Active", transactionNumber: "B-3085754XYD48", dateApproved: "1755824280" },
            { name: "Rexar", title: "Financial", status: "Expired", transactionNumber: "B-3214XYD49", dateApproved: "1755824280" },
            { name: "Ahri", title: "Financial", status: "Expired", transactionNumber: "H03354XYD50", dateApproved: "1755824280" },
            { name: "Shadow", title: "Ambulance", status: "Active", transactionNumber: "B-3214XYD51", dateApproved: "1755824280" },
            { name: "Maki", title: "Financial", status: "Active", transactionNumber: "B-3214XYD52", dateApproved: "1755824280" },
            { name: "Bernadet", title: "Financial", status: "Expired", transactionNumber: "B-3214XYD53", dateApproved: "1755824280" },
            { name: "Jake the dog", title: "Food Assistance", status: "Expired", transactionNumber: "B-3214XYD54", dateApproved: "1755824280" },
            { name: "Fin the human", title: "Financial", status: "Expired", transactionNumber: "B-3214XYD55", dateApproved: "1755824280" },
            { name: "Ice King", title: "Financial", status: "Active", transactionNumber: "B-3214XYD56", dateApproved: "1755824280" },
            { name: "Beemo", title: "Ambulance", status: "Active", transactionNumber: "B-3214XYD57", dateApproved: "1755824280" },
            { name: "Pricess Bubble Gum", title: "Financial", status: "Expired", transactionNumber: "B-3214XYD58", dateApproved: "1755824280" },
            { name: "Donut", title: "Food Assistance", status: "Expired", transactionNumber: "B-3214XYD59", dateApproved: "1755824280" },
            { name: "Marceline", title: "Financial", status: "Expired", transactionNumber: "B-3214XYD60", dateApproved: "1755824280" },
            { name: "Bat", title: "Food Assistance", status: "Expired", transactionNumber: "B-3214XYD61", dateApproved: "1755824280" },
        ];

        const logsData = [
            { title: "New Record", description: "You have added new records", date: "1755824280" },
            { title: "New Record", description: "You have added new records", date: "1755824256" },
        ];

        setLoadedRequestData(dummy);
        setActivityLogsList(logsData);
        setFilteringHolder(dummy);
    }, []);

    async function searchKeyword(keyword: string) {
        if (keyword === null || keyword === "") {
            setFilteringHolder(loadedRequestData);
            return;
        }
        const filtered = loadedRequestData.filter((req) =>
            req.transactionNumber.toLowerCase().includes(keyword.toLowerCase()) ||
            req.title.toLowerCase().includes(keyword.toLowerCase())
        );

        setFilteringHolder(filtered);
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
                                    case "Dashboard":
                                        setFilteringHolder(loadedRequestData);
                                        break;
                                    case "Activity Logs":
                                        setFilteringHolder(activityLogsList);
                                        break;
                                }
                                setActiveItem(item.label);
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

                    <div className="flex flex-row items-center gap-2">
                        <SearchBar onSearch={(e) => searchKeyword(e)} searchBarHint={'Search...'} />

                        <div className='ml-2' />

                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-black text-white hover:bg-gray-800">
                                    <List size={50} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {activeItem === "Dashboard" &&
                                    <DropdownMenuItem onClick={() => {
                                        setIsAddNewRecordDialogOpen(true);
                                    }}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Record
                                    </DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => {
                                    setIsSortSelectionDialogOpen(true);
                                }}>
                                    <SortAscIcon className="mr-2 h-4 w-4" />
                                    Sort By
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className='mt-5 mb-5' />

                <div className="w-full">
                    {
                        activeItem === "Dashboard" && (
                            <Dashboard data={filteringHolder} />
                        )
                    }

                    {
                        activeItem === "Activity Logs" && (
                            <ActivityLog data={filteringHolder} />
                        )
                    }

                    <AddNewRecordDialog isOpen={isAddNewRecordDialogOpen} onClose={() => setIsAddNewRecordDialogOpen(false)} />
                    <SortSelectionDialog isOpen={isSortSelectionDialogOpen} onClose={() => setIsSortSelectionDialogOpen(false)} />
                </div>
            </div>
        </div>
    );
}