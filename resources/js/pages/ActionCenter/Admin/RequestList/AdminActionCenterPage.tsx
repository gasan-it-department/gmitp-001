import AdminLayout from '@/layouts/App/AppLayout';
import ClassicDialog from '@/pages/Utility/ClassicDialog';
import Utility from '@/pages/Utility/Utility';
import { ArrowLeftRight, Home, LogOut, LogsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddEditRecordDialog from '../Components/AddEditRecordDialog';
import Dashboard from '../Components/Dashboard';
import Header from '../Components/Header';
import SortSelectionDialog from '../Components/SortSelectionDialog';

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
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [activityLogsList, setActivityLogsList] = useState<LogsData[]>([]);
    const [currentSelectedSortOption, setCurrentSelectedSortOption] = useState('');
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [isClassicDialogShowing, setIsClassicDialogShowing] = useState(false);
    const [editData, setEditData] = useState<ClientData | null>(null);

    const menuItems = [
        { label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
        { label: 'Activity Logs', icon: <LogsIcon className="h-5 w-5" /> },
        { label: 'Transfers', icon: <ArrowLeftRight size={20} /> },
        { label: 'Logout', icon: <LogOut className="h-5 w-5 text-red-400" /> },
    ];

    useEffect(() => {
        const dummy = [
            {
                firstName: 'Analiza',
                lastName: 'Otong',
                middleName: 'Middle',
                contactNumber: '09953450732',
                service: 'Financial',
                transactionNumber: 'SF45GT4TW',
                dateApproved: '175585334',
                description: 'Lorem ipsum dolor sit amet.',
                province: 'Marinduque',
                municipality: 'Gasan',
                barangay: 'Bahi',
            },
        ];

        const logsData = [
            { title: 'New Record', description: 'You have added new records', date: '1755824280' },
            { title: 'New Record', description: 'You have added new records', date: '1755824256' },
        ];

        setLoadedRequestData(dummy);
        setActivityLogsList(logsData);
        setFilteringHolder(dummy);
    }, []);

    async function sortList(sortOption: string) {
        console.log(`Selected option: ${sortOption}`);
        switch (sortOption) {
            case 'sort_status':
                const sortedByStatus = [...filteringHolder].sort((a, b) => {
                    const isEligibleA = Utility().calculateTotalDays(a.dateApproved) >= 92;
                    const isEligibleB = Utility().calculateTotalDays(b.dateApproved) >= 92;
                    if (isEligibleA && !isEligibleB) return -1;
                    if (!isEligibleA && isEligibleB) return 1;
                    return a.name.localeCompare(b.name);
                });
                setFilteringHolder(sortedByStatus);
                break;

            case 'sort_due_date':
                const sortByDueDate = [...filteringHolder].sort((a, b) => {
                    const timeA = parseInt(a.dateApproved || '0', 10) + 160 * 24 * 60 * 60;
                    const timeB = parseInt(b.dateApproved || '0', 10) + 160 * 24 * 60 * 60;
                    return timeA - timeB;
                });

                setFilteringHolder(sortByDueDate);
                break;

            case 'sort_transaction_id':
                const sortByTransactionId = [...filteringHolder].sort((a, b) => (a.transactionNumber || '').localeCompare(b.transactionNumber || ''));
                setFilteringHolder(sortByTransactionId);
                break;

            case 'sort_title':
                const sortByTitle = [...filteringHolder].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                setFilteringHolder(sortByTitle);
                break;
            case 'sort_request_date': {
                const sortByDate = [...filteringHolder].sort((a, b) => {
                    const timeA = a.dateApproved ? parseInt(a.dateApproved, 10) : 0;
                    const timeB = b.dateApproved ? parseInt(b.dateApproved, 10) : 0;
                    return timeB - timeA; // newest first
                });
                setFilteringHolder(sortByDate);
                break;
            }

            case 'sort_name': {
                const sortByName = [...filteringHolder].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                setFilteringHolder(sortByName);
                break;
            }
        }

        setIsSortSelectionDialogOpen(false);
    }

    return (
        <AdminLayout>
            <Header
                className="m-5 flex justify-end"
                onAddNewButtonClicked={() => {
                    setEditData(null); // new record, not edit
                    setIsAddNewRecordDialogOpen(true);
                }}
                onExportButtonClicked={() => console.log('Export clicked!')}
                onFilterButtonClicked={() => setIsSortSelectionDialogOpen(true)}
                onSearch={(query) => console.log('Searching for:', query)}
            />

            <div className="m-5 mt-0 flex-1 bg-white">
                <div className="w-full">
                    <Dashboard
                        data={filteringHolder}
                        onViewDetailsEditButtonClicked={(editData) => {
                            setEditData(editData ?? null);
                            setIsAddNewRecordDialogOpen(true);
                        }}
                        onViewDetialsDeleteButtonClicked={() => {}}
                    />
                    <AddEditRecordDialog isOpen={isAddNewRecordDialogOpen} onClose={() => setIsAddNewRecordDialogOpen(false)} />

                    <SortSelectionDialog
                        currentSelected={currentSelectedSortOption}
                        selectedSortOption={(selectedSortOption) => {
                            sortList(selectedSortOption);
                            setCurrentSelectedSortOption(selectedSortOption);
                        }}
                        isOpen={isSortSelectionDialogOpen}
                        onClose={() => setIsSortSelectionDialogOpen(false)}
                    />

                    <ClassicDialog
                        title={dialogTitle}
                        message={dialogMessage}
                        negativeButtonText="Cancel"
                        positiveButtonText="Logout"
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
        </AdminLayout>
    );
}
