import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import PublicLayout from "@/layouts/Public/wrapper/PublicLayoutTemplate";
import Utility from "@/pages/Utility/Utility";

type AnnouncementData = {
    title: string;
    message: string;
    date: string;
    id: string;
};

const data: AnnouncementData[] = [
    {
        title: 'Suspension of Classes Due to Heavy Rainfall',
        message:
            'All levels, both public and private, are hereby suspended today, October 10, 2025, due to continuous heavy rainfall and flooding in low-lying areas. Please stay indoors and keep safe.',
        date: '1760056824',
        id: 'TXN-001',
    },
    {
        title: 'Power Interruption Notice',
        message:
            'Please be informed that there will be a scheduled power interruption on October 12, 2025, from 8:00 AM to 12:00 NN to give way to maintenance activities by the local electric cooperative. We apologize for the inconvenience.',
        date: '1760056824',
        id: 'TXN-002',
    },
    {
        title: 'Municipal Hall Maintenance Work',
        message:
            'The Gasan Municipal Hall will be closed on October 14, 2025, for a one-day general cleaning and maintenance. Regular operations will resume on October 15, 2025. Thank you for your understanding.',
        date: '1760056824',
        id: 'TXN-003',
    },
    {
        title: 'Public Advisory on Water Supply',
        message:
            'The Gasan Water District has announced a temporary water service interruption on October 11, 2025, from 10:00 PM to 5:00 AM the following day due to line flushing. Consumers are advised to store enough water for their needs.',
        date: '1760056824',
        id: 'TXN-004',
    },
    {
        title: 'Upcoming Blood Donation Drive',
        message:
            'Join us for the Blood Donation Drive on October 20, 2025, at the Municipal Covered Court from 8:00 AM to 3:00 PM. Let’s save lives together!',
        date: '1760056824',
        id: 'TXN-005',
    },
    {
        title: 'Barangay Assembly Schedule',
        message:
            'All residents are invited to attend the Barangay Assembly on October 18, 2025, at 9:00 AM. Important community updates will be discussed.',
        date: '1760056824',
        id: 'TXN-006',
    },
    {
        title: 'Traffic Advisory: Road Repair in Poblacion',
        message:
            'Portions of the Poblacion Road will be temporarily closed starting October 15, 2025, for repair and improvement works. Please use alternate routes.',
        date: '1760056824',
        id: 'TXN-007',
    },
    {
        title: 'Health Alert: Dengue Prevention Campaign',
        message:
            'The Municipal Health Office urges residents to participate in the 4S campaign: Search and destroy, Self-protection, Seek early consultation, and Support fogging only in hotspot areas.',
        date: '1760056824',
        id: 'TXN-008',
    },
    {
        title: 'Barangay Clean-Up Drive',
        message:
            'Join our community clean-up drive on October 19, 2025, 7:00 AM at the Barangay Hall. Bring cleaning tools and wear protective gear.',
        date: '1760056824',
        id: 'TXN-009',
    },
    {
        title: 'Vaccination Schedule Update',
        message:
            'Free flu vaccination will be available at the Rural Health Unit on October 22–23, 2025, for senior citizens and persons with disabilities.',
        date: '1760056824',
        id: 'TXN-010',
    },
    {
        title: 'Announcement: Job Fair 2025',
        message:
            'The Gasan Municipal PESO Office will host a Job Fair on October 25, 2025, at the Municipal Covered Court. Bring your resume and valid ID.',
        date: '1760056824',
        id: 'TXN-011',
    },
    {
        title: 'Waste Collection Schedule',
        message:
            'Garbage collection will follow the adjusted schedule next week due to the holiday. Please check your barangay bulletin board for updated pickup times.',
        date: '1760056824',
        id: 'TXN-012',
    },
    {
        title: 'Holiday Notice: Barangay Day Celebration',
        message:
            'Municipal offices will be closed on October 21, 2025, in celebration of Barangay Day. Regular work resumes on October 22, 2025.',
        date: '1760056824',
        id: 'TXN-013',
    },
    {
        title: 'Public Hearing on Local Ordinance',
        message:
            'A public hearing for the proposed Solid Waste Management Ordinance will be held on October 17, 2025, at the Municipal Session Hall.',
        date: '1760056824',
        id: 'TXN-014',
    },
    {
        title: 'Scholarship Application Period Open',
        message:
            'The Municipal Scholarship Office is now accepting applications for the 2025–2026 school year. Deadline is November 10, 2025.',
        date: '1760056824',
        id: 'TXN-015',
    },
    {
        title: 'Emergency Hotline Numbers Update',
        message:
            'Please take note of the updated emergency hotline numbers for the Gasan Police, Fire Station, and Health Office available on the official website.',
        date: '1760056824',
        id: 'TXN-016',
    },
    {
        title: 'Typhoon Preparedness Reminder',
        message:
            'Residents are advised to prepare emergency kits and monitor weather updates from PAGASA as a new typhoon approaches the area.',
        date: '1760056824',
        id: 'TXN-017',
    },
    {
        title: 'Public Market Renovation Notice',
        message:
            'Renovation work at the Gasan Public Market will begin on October 27, 2025. Certain stalls will be relocated temporarily.',
        date: '1760056824',
        id: 'TXN-018',
    },
    {
        title: 'Barangay Health Outreach Program',
        message:
            'Free medical check-ups and consultations will be conducted at Barangay Tabionan on October 16, 2025, starting 8:00 AM.',
        date: '1760056824',
        id: 'TXN-019',
    },
    {
        title: 'Local Sports Tournament Registration',
        message:
            'Registration for the Gasan Inter-Barangay Basketball Tournament is now open until October 24, 2025, at the Municipal Sports Office.',
        date: '1760056824',
        id: 'TXN-020',
    },
    {
        title: 'Community Tree Planting Activity',
        message:
            'Let’s make Gasan greener! Join us for a tree planting event on October 26, 2025, at 6:00 AM near the coastal road.',
        date: '1760056824',
        id: 'TXN-021',
    },
    {
        title: 'Road Safety Reminder',
        message:
            'Motorists are reminded to observe the new speed limit ordinance within the municipality. Violators will be fined accordingly.',
        date: '1760056824',
        id: 'TXN-022',
    },
    {
        title: 'Animal Vaccination Program',
        message:
            'Free anti-rabies vaccination for dogs and cats will be held on October 23, 2025, at the Barangay Health Center. Bring your pets and vaccination card.',
        date: '1760056824',
        id: 'TXN-023',
    },
    {
        title: 'Barangay Lighting Improvement Project',
        message:
            'Installation of new LED streetlights in Barangay Pinggan will start on October 18, 2025. Expect brief power interruptions during installation.',
        date: '1760056824',
        id: 'TXN-024',
    },
    {
        title: 'Senior Citizens General Assembly',
        message:
            'All senior citizens are invited to attend the General Assembly on October 28, 2025, 9:00 AM at the Municipal Gym. Snacks will be served.',
        date: '1760056824',
        id: 'TXN-025',
    },
];

export default function GeneralAnnouncementList() {
    return (
        <PublicLayout title={"Announcements"} description={""}>
            <div className="mx-auto w-full px-5 py-10">
                <div className="mb-8 flex items-center justify-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-3 text-white shadow-md">
                        <Megaphone className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                        General Announcements
                    </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {data.map((item) => (
                        <Card
                            key={item.id}
                            className="group flex flex-col justify-between h-[280px] border border-orange-200/40 
                 bg-gradient-to-br from-red-50 via-orange-50 to-orange-100 
                 p-5 shadow-sm transition-transform 
                 hover:scale-[1.01] hover:shadow-md 
                 dark:from-red-900/30 dark:via-orange-900/20 dark:to-gray-900"
                        >
                            <CardHeader className="p-0 mb-2">
                                <CardTitle className="text-lg font-semibold text-red-700 dark:text-orange-100 
                              group-hover:text-orange-600 transition-colors line-clamp-2">
                                    {item.title}
                                </CardTitle>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {Utility().formatTimeAgo(item.date)}
                                </p>
                            </CardHeader>

                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <p className="text-sm text-orange-800/80 dark:text-orange-200/80 line-clamp-4">
                                    {item.message}
                                </p>
                            </CardContent>

                            <div className="mt-3">
                                <button className="text-sm font-medium text-orange-600 hover:underline">
                                    Read more
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>


            </div>
        </PublicLayout>
    );
}
