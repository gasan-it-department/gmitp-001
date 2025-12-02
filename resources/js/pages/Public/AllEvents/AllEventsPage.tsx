import PublicLayout from "@/layouts/Public/PublicLayout";
import AllEvenntsTable from "./Components/AllEventsTable";

export default function AllEventsPage() {
    return (
        <PublicLayout title="Executive Order" description="">
            <AllEvenntsTable />
        </PublicLayout>
    );
}