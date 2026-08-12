import PublicLayout from '@/layouts/Public/PublicLayout';
import AllAnnouncementTable from './Components/AllAnnouncementTable';

export default function AllAnnouncements() {
    return (
        <PublicLayout
            title="Municipal Announcements"
            description="Browse the latest municipal announcements, advisories, notices, and community information."
        >
            <AllAnnouncementTable />
        </PublicLayout>
    );
}
