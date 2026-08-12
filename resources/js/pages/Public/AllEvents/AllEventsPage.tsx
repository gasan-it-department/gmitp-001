import PublicLayout from '@/layouts/Public/PublicLayout';
import AllEvenntsTable from './Components/AllEventsTable';

export default function AllEventsPage() {
    return (
        <PublicLayout title="Municipal Events" description="Browse festivals, government activities, and community events from the municipality.">
            <AllEvenntsTable />
        </PublicLayout>
    );
}
