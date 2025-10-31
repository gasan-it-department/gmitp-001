import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BulletinHeader from "./BulletinHeader";
import AddEditAnnouncementDialog from "./AddEditAnnouncementDialog";
import { useState } from "react";

export default function AnnouncementPageTable() {
    const [isAddEditDialogOpened, setIsAddEditDialogOpened] = useState(false);

    const dummy = [
        {
            title: "System Maintenance Scheduled on November 2",
            message: "Our servers will undergo scheduled maintenance on November 2 from 12:00 AM to 4:00 AM. Please save your work beforehand to avoid interruptions.",
            id: "A001",
            date_posted: "2025-10-31"
        },
        {
            title: "New Policy Update: Data Privacy Guidelines",
            message: "We have updated our data privacy policy to enhance protection of user information. Please review the full document in your account settings.",
            id: "A002",
            date_posted: "2025-10-30"
        },
        {
            title: "Office Closure for All Saints’ Day",
            message: "In observance of All Saints’ Day, our offices will be closed on November 1. Regular operations will resume on November 2.",
            id: "A003",
            date_posted: "2025-10-29"
        },
        {
            title: "New Feature: Announcement Board",
            message: "We’re excited to introduce the Announcement Board feature! Stay updated with the latest organizational news, system changes, and upcoming events.",
            id: "A004",
            date_posted: "2025-10-28"
        },
        {
            title: "This is announcement 5. Reminder for Monthly Report Submission",
            message: "All departments are reminded to submit their monthly performance reports by the 5th of every month. Late submissions will not be accepted.",
            id: "A005",
            date_posted: "2025-10-27"
        },
        {
            title: "Network Upgrade Completed Successfully",
            message: "The network infrastructure upgrade was successfully completed. Users should now experience faster load times and improved reliability.",
            id: "A006",
            date_posted: "2025-10-26"
        },
        {
            title: "Training Session: Effective Communication Skills",
            message: "A new training session on communication skills will be held on November 10. Interested employees can register through the HR portal.",
            id: "A007",
            date_posted: "2025-10-25"
        },
        {
            title: "Important Security Notice",
            message: "We’ve detected phishing attempts targeting staff emails. Do not click on suspicious links and report any unusual messages to IT support immediately.",
            id: "A008",
            date_posted: "2025-10-24"
        },
        {
            title: "Holiday Party Announcement",
            message: "Mark your calendars! Our annual holiday celebration will take place on December 20. More details about the venue and activities will follow soon.",
            id: "A009",
            date_posted: "2025-10-23"
        },
        {
            title: "Employee of the Month: Congratulations to Jane Doe!",
            message: "We’re proud to announce that Jane Doe has been selected as Employee of the Month for her outstanding dedication and teamwork.",
            id: "A010",
            date_posted: "2025-10-22"
        }
    ];


    return (
        <div>
            {/* HEADER */}
            <div className="my-5 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-balance">Announcement List</h1>
                <BulletinHeader
                    onSearch={(keywords) => {

                    }}
                    onFilterButtonClicked={() => {

                    }}
                    onExportButtonClicked={() => {

                    }}
                    onAddNewButtonClicked={() => {
                        setIsAddEditDialogOpened(true);
                    }}
                />
            </div>

            {/* TABLE */}
            <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-gray-200">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Title</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Message</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">Date Posted</TableHead>
                            <TableHead className="bg-gray-50 text-[12px] font-bold">ID</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {dummy.map((item, index) => (
                            <TableRow key={index} className="hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                    console.log("Clicked", item.title);
                                }}>
                                <TableCell className="text-[12px] ">{item.title}</TableCell>
                                <TableCell className="text-[12px] max-w-[300px] line-clamp-2 p-1">
                                    {item.message}
                                </TableCell>
                                <TableCell className="text-[12px]">{item.date_posted || "—"}</TableCell>
                                <TableCell className="text-[12px]">{item.id}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AddEditAnnouncementDialog
                isOpen={ isAddEditDialogOpened }
                onClose={ () => setIsAddEditDialogOpened(false) }
            />
        </div>
    );
}
