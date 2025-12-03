import PublicLayout from "@/layouts/Public/PublicLayout";
import AllEvenntsTable from "./Components/AllEventsTable";

export default function AllEventsPage() {
    return (
        <PublicLayout title="All Events" description="">
            <AllEvenntsTable />
        </PublicLayout>
    );
}